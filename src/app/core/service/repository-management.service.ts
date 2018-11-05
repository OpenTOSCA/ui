/*
 * Copyright (c) 2018 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../../configuration/configuration.service';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { Path } from '../util/path';
import { CsarUploadReference } from '../model/csar-upload-request.model';
import { MarketplaceApplication } from '../model/marketplace-application.model';
import { MarketplaceApplicationReference } from '../model/marketplace-application-reference.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class RepositoryManagementService {

    constructor(private http: HttpClient,
                private adminService: ConfigurationService,
                private logger: OpenToscaLoggerService) {
    }

    /**
     * Retrieve a list of references to applications available on the marketplace
     * @returns {Promise<Array<MarketplaceApplicationReference>>}
     */
    getAppsFromMarketPlace(): Observable<Array<MarketplaceApplicationReference>> {
        const url = this.adminService.getWineryAPIURL();
        this.logger.log('[marketplace.service][getAppsFromMarketPlace] Loading Apps from repo: ', url);
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<Array<MarketplaceApplicationReference>>(url, httpOptions)
            .pipe(
                // TODO: Check, if Apps are already installed in container
                catchError(err => this.logger.handleError('[marketplace.service][getAppsFromMarketPlace]', err)
                )
            );
    }

    /**
     * Fetch data.json from winery
     * @param appReference Reference object that contains namespace and id of application
     * @param marketPlaceUrl URL to winery instance
     * @returns {Promise<MarketplaceApplication>}
     */
    getAppFromMarketPlace(appReference: MarketplaceApplicationReference, marketPlaceUrl: string): Observable<MarketplaceApplication> {
        const url = marketPlaceUrl + encodeURIComponent(encodeURIComponent(appReference.namespace))
            + '/' + encodeURIComponent(encodeURIComponent(appReference.id));    // tslint:disable-line:max-line-length
        const selfServiceURL = url + '/selfserviceportal';
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(selfServiceURL, httpOptions)
            .pipe(
                map(response => {
                        const app = response as MarketplaceApplication;
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
                    }
                ),
                catchError(err => this.logger.handleError('[marketplace.service][getAppFromMarketPlace]', err))
            );
    }

    /**
     * Deploy CSAR in container via URL to CSAR
     * @param app CsarUploadReference to deploy to container
     * @param containerURL Container endpoint URL (e.g., http://localhost:1337)
     * @returns {Promise<any>}
     */
    installAppInContainer(app: CsarUploadReference, containerURL: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post(containerURL, app, httpOptions);
    }

    /**
     * Retrieve app description from data.json
     * @param appID CSAR id/name (e.g. XYZ.csar)
     * @returns {Promise<MarketplaceApplication>}
     */
    getAppDescription(appID: string): Observable<MarketplaceApplication> {
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
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };

        return this.http.get(dataJSONUrl, httpOptions)
            .pipe(
                map(response => {
                    const app = response as MarketplaceApplication;
                    app.id = appID;
                    app.iconUrl = metaDataUrl + '/' + app.iconUrl;
                    app.imageUrl = metaDataUrl + '/' + app.imageUrl;
                    for (const i in app.screenshotUrls) {
                        if (app.screenshotUrls[i]) {
                            app.screenshotUrls[i] = metaDataUrl + '/' + app.screenshotUrls[i];
                        }
                    }
                    return app;
                }),
                catchError(err => this.logger.handleError('[marketplace.service][getAppDescription]', err))
            );
    }
}
