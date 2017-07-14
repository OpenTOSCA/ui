/**
 * Copyright (c) 2017 University of Stuttgart.
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
import { Http, Headers, RequestOptions } from '@angular/http';
import { ConfigurationService } from '../../configuration/configuration.service';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { MarketplaceApplicationReference } from '../model/marketplace-application-reference.model';
import { MarketplaceApplication } from '../model/marketplace-application.model';
import { Path } from '../util/path';
import { CsarUploadReference } from '../model/new-api/csar-upload-request.model';

@Injectable()
export class RepositoryManagementService {

    constructor(private http: Http,
                private adminService: ConfigurationService,
                private logger: OpenToscaLoggerService) {
    }

    /**
     * Retrieve a list of references to applications available on the marketplace
     * @returns {Promise<Array<MarketplaceApplicationReference>>}
     */
    getAppsFromMarketPlace(): Promise<Array<MarketplaceApplicationReference>> {
        const url = this.adminService.getWineryAPIURL();
        this.logger.log('[marketplace.service][getAppsFromMarketPlace] Loading Apps from repo: ', url);
        const headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                // TODO: Check, if Apps are already installed in container
                return response.json() as MarketplaceApplicationReference[];
            })
            .catch(err => this.logger.handleError('[marketplace.service][getAppsFromMarketPlace]', err));
    }

    /**
     * Fetch data.json from winery
     * @param appReference Reference object that contains namespace and id of application
     * @param marketPlaceUrl URL to winery instance
     * @returns {Promise<MarketplaceApplication>}
     */
    getAppFromMarketPlace(appReference: MarketplaceApplicationReference, marketPlaceUrl: string): Promise<MarketplaceApplication> {
        const url = marketPlaceUrl + encodeURIComponent(encodeURIComponent(appReference.namespace))
            + '/' + encodeURIComponent(encodeURIComponent(appReference.id));    // tslint:disable-line:max-line-length
        const selfServiceURL = url + '/selfserviceportal';
        const headers = new Headers({'Accept': 'application/json'});
        return this.http.get(selfServiceURL, {headers: headers})
            .toPromise()
            .then(response => {
                const app = response.json() as MarketplaceApplication;
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
            .catch(err => this.logger.handleError('[marketplace.service][getAppFromMarketPlace]', err));
    }

    /**
     * Deploy CSAR in container via URL to CSAR
     * @param app MarketplaceApplication to deploy to container
     * @param containerURL Container endpoint URL (e.g., http://localhost:1337)
     * @returns {Promise<any>}
     */
    installAppInContainer(app: MarketplaceApplication, containerURL: string): Promise<any> {
        const reqOpts = new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})});
        return this.http.post(containerURL, new CsarUploadReference(app.csarURL, app.id), reqOpts)
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

        const metaDataUrl = new Path(this.adminService.getContainerAPIURL())
            .append('containerapi')
            .append('CSARs')
            .append(appID)
            .append('.csar')
            .append('Content')
            .append('SELFSERVICE-Metadata')
            .toString();
        const dataJSONUrl = new Path(metaDataUrl)
            .append('data.json')
            .toString();
        const headers = new Headers({'Accept': 'application/json'});

        return this.http.get(dataJSONUrl, {headers: headers})
            .toPromise()
            .then(response => {
                const app = response.json() as MarketplaceApplication;
                app.id = appID;
                app.iconUrl = metaDataUrl + '/' + app.iconUrl;
                app.imageUrl = metaDataUrl + '/' + app.imageUrl;
                for (const i in app.screenshotUrls) {
                    if (app.screenshotUrls[i]) {
                        app.screenshotUrls[i] = metaDataUrl + '/' + app.screenshotUrls[i];
                    }
                }
                return app;
            })
            .catch(err => this.logger.handleError('[marketplace.service][getAppDescription]', err));
    }
}
