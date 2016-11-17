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

import { Application } from './model/application.model';
import { MarketplaceApplicationReference } from './model/marketplace-application-reference.model';
import { AdministrationService } from '../administration/administration.service';

@Injectable()
export class MarketplaceService {

    constructor(private http: Http, private adminService: AdministrationService) {
    }

    /**
     * Retrieve a list of references to applications available on the marketplace
     * @returns {Promise<ApplicationReference[]>}
     */
    getAppsFromMarketPlace(): Promise<MarketplaceApplicationReference[]> {
        const url = this.adminService.getWineryAPIURL();
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => response.json() as MarketplaceApplicationReference[])
            .catch(this.handleError);
    }

    /**
     * Fetch data.json from winery
     * @param appReference Reference object that contains namespace and id of application
     * @param marketPlaceUrl URL to winery instance
     * @returns {Promise<TResult>}
     */
    getAppFromMarketPlace(appReference: MarketplaceApplicationReference, marketPlaceUrl: string) {
        const url = marketPlaceUrl + encodeURIComponent(encodeURIComponent(appReference.namespace)) + '/' + encodeURIComponent(encodeURIComponent(appReference.id)) + '/selfserviceportal';
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                let app = response.json();
                // TODO: create model for marketplace applications
                app.iconUrl = url + '/' + app.iconUrl;
                app.imageUrl = url + '/' + app.imageUrl;
                app.csarURL = url.substr(0, url.lastIndexOf('/selfserviceportal')) + '?csar';
                return app;
            })
            .catch(this.handleError);
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
        return this.http.post(postURL, body, {headers: headers})
            .toPromise()
            .then(response => console.log(response.headers, response.headers.get('Location')))
            .catch(this.handleError);
    }

    /*searchApps(term: string): Observable<Application[]> {
     console.log('Searching Apps');
     return  this.http.get(this.containerAPI + `/?name=${term}`)
     .map((r: Response) => r.json().data as Application[]);
     }*/

    /*getApp(id: string): Promise<Application> {
     return this.getApps()
     .then(references => references.find(ref => ref.title === id))
     .catch(this.handleError);;
     }*/

    /**
     * Retrieve app description from data.json
     * @param appID CSAR id/name (e.g. XYZ.csar)
     * @returns {Promise<Application>}
     */
    getAppDescription(appID: string): Promise<Application> {
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
                let app = response.json() as Application;
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
            .catch(this.handleError);
    }

    /*deleteApp(id: number): Promise<void> {
     let url = `$` + this.applicationsUrl + `/${id}`;
     return this.http.delete(url, {headers: this.headers})
     .toPromise()
     .then(() => null)
     .catch(this.handleError);
     }*/

    /**
     * Print errors to console
     * @param error
     * @returns {Promise<void>|Promise<T>}
     */
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
