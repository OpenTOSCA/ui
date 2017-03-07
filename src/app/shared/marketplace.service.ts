/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *     Oliver Kopp - fixing of URL encoding
 */
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AdministrationService } from '../administration/administration.service';
import { Application } from './model/application.model';
import { MarketplaceApplicationReference } from './model/marketplace-application-reference.model';
import { MarketplaceApplication } from './model/marketplace-application.model';

import { Logger } from './helper';

@Injectable()
export class MarketplaceService {

    constructor(private http: Http, private adminService: AdministrationService) {
    }

    /**
     * Retrieve a list of references to applications available on the marketplace
     * @returns {Promise<Array<MarketplaceApplicationReference>>}
     */
    getAppsFromMarketPlace(): Promise<Array<MarketplaceApplicationReference>> {
        const url = this.adminService.getWineryAPIURL();
        console.log('[marketplace.service][getAppsFromMarketPlace] Loading Apps from repo: ', url);
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                // TODO: Check, if Apps are already installed in container
                return response.json() as MarketplaceApplicationReference[];
            })
            .catch(err => Logger.handleError('[marketplace.service][getAppsFromMarketPlace]', err));
    }

    /**
     * Fetch data.json from winery
     * @param appReference Reference object that contains namespace and id of application
     * @param marketPlaceUrl URL to winery instance
     * @returns {Promise<MarketplaceApplication>}
     */
    getAppFromMarketPlace(appReference: MarketplaceApplicationReference, marketPlaceUrl: string): Promise<MarketplaceApplication> {
        const url = marketPlaceUrl + encodeURIComponent(encodeURIComponent(appReference.namespace)) + '/' + encodeURIComponent(encodeURIComponent(appReference.id));    // tslint:disable-line:max-line-length
        const selfServiceURL = url + '/selfserviceportal';
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(selfServiceURL, {headers: headers})
            .toPromise()
            .then(response => {
                let app = response.json() as MarketplaceApplication;
                app.iconUrl = selfServiceURL + '/' + app.iconUrl;
                app.imageUrl = selfServiceURL + '/' + app.imageUrl;
                app.csarURL = selfServiceURL.substr(0, selfServiceURL.lastIndexOf('/selfserviceportal')) + '?csar';
                app.repositoryURL = url;
                app.id = appReference.id;
                app.isInstalling = false;
                if (!app.displayName || app.displayName === '') {
                    app.displayName = appReference.id;
                }
                return app;
            })
            .catch(err => Logger.handleError('[marketplace.service][getAppFromMarketPlace]', err));
    }

    /**
     * Deploy CSAR in container via URL to CSAR
     * @param csarURL URL to CSAR
     * @param containerURL Container endpoint URL (e.g., http://localhost:1337/containerapi)
     * @returns {Promise<TResult>}
     */
    installAppInContainer(csarURL: string, containerURL: string): Promise<any> {
        const postURL = containerURL + '/CSARs';
        const body = {
            'URL': csarURL
        };
        const headers = new Headers({'Accept': 'application/json'});
        // TODO: Check if App is already installed in container, if true then don't post
        return this.http.post(postURL, body, {headers: headers})
            .toPromise();
    }

    /**
     * Retrieve app description from data.json
     * @param appID CSAR id/name (e.g. XYZ.csar)
     * @returns {Promise<Application>}
     */
    getAppDescription(appID: string): Promise<MarketplaceApplication> {
        // Remove .csar if present
        if (appID.indexOf('.csar') > -1) {
            appID = appID.split('.')[0];
        }

        const metaDataUrl = this.adminService.getContainerAPIURL() + '/CSARs/' + appID + '.csar' + '/Content/SELFSERVICE-Metadata';
        const dataJSONUrl = metaDataUrl + '/data.json';
        let headers = new Headers({'Accept': 'application/json'});

        return this.http.get(dataJSONUrl, {headers: headers})
            .toPromise()
            .then(response => {
                let app = response.json() as MarketplaceApplication;
                app.id = appID;
                app.iconUrl = metaDataUrl + '/' + app.iconUrl;
                app.imageUrl = metaDataUrl + '/' + app.imageUrl;
                for (let i in app.screenshotUrls) {
                    if (app.screenshotUrls[i]) {
                        app.screenshotUrls[i] = metaDataUrl + '/' + app.screenshotUrls[i];
                    }
                }
                return app;
            })
            .catch(err => Logger.handleError('[marketplace.service][getAppDescription]', err));
    }
}
