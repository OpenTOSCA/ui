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
import { CsarUploadReference } from '../model/csar-upload-request.model';
import { MarketplaceApplication } from '../model/marketplace-application.model';
import { MarketplaceApplicationReference } from '../model/marketplace-application-reference.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class RepositoryService {

    constructor(private http: HttpClient,
                private adminService: ConfigurationService,
                private logger: OpenToscaLoggerService) {
    }

    getApplications(): Observable<Array<MarketplaceApplicationReference>> {
        const url = this.adminService.getRepositoryUrl();
        this.logger.log('[marketplace.service][getApplications] Loading Apps from repo: ', url);
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<Array<MarketplaceApplicationReference>>(url, httpOptions)
            .pipe(
                catchError(err => this.logger.handleError('[marketplace.service][getApplications]', err)
                )
            );
    }

    getApplication(ref: MarketplaceApplicationReference, url: string): Observable<MarketplaceApplication> {
        url = url + encodeURIComponent(encodeURIComponent(ref.namespace))
            + '/' + encodeURIComponent(encodeURIComponent(ref.id));
        const selfServiceUrl = url + '/selfserviceportal';
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(selfServiceUrl, httpOptions)
            .pipe(
                map(response => {
                        const app = response as MarketplaceApplication;
                        app.iconUrl = selfServiceUrl + '/' + app.iconUrl;
                        app.imageUrl = selfServiceUrl + '/' + app.imageUrl;
                        app.csarURL = selfServiceUrl.substr(0, selfServiceUrl.lastIndexOf('/selfserviceportal')) + '?csar';
                        app.repositoryURL = url;
                        app.id = ref.id;
                        app.isInstalling = false;
                        if (!app.displayName || app.displayName === '') {
                            app.displayName = ref.id;
                        }
                        return app;
                    }
                ),
                catchError(err => this.logger.handleError('[marketplace.service][getApplication]', err))
            );
    }

    installApplication(app: CsarUploadReference, containerUrl: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post(containerUrl, app, httpOptions);
    }
}
