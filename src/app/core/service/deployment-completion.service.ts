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
import * as _ from 'lodash';
import { LoggerService } from './logger.service';
import { MarketplaceApplication } from '../model/marketplace-application.model';
import { InjectionOption } from '../model/injection-option.model';
import { InjectionOptions } from '../model/injection-options.model';
import { TopologyTemplate } from '../model/topology-template.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Path } from '../path';
import { InjectionOptionsResponse } from '../model/injection-options-response.model';

@Injectable()
export class DeploymentCompletionService {

    constructor(private http: HttpClient,
                private logger: LoggerService) {
    }

    getInjectionOptions(serviceTemplateURL: string): Promise<any> {
        const url = new Path(serviceTemplateURL)
            .append('injector')
            .append('options')
            .toString();
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<InjectionOptionsResponse>(url, httpOptions)
            .toPromise()
            .then(response => {
                this.logger.log('[deployment-completion.service][getInjectionOptions]', 'InjectionOption Winery Response:' + response);
                const injectionOptionsResponse = response;

                const injectionOptions = new InjectionOptions();
                let injectionOptionEntries: Array<InjectionOption> = [];
                let options: Array<TopologyTemplate> = [];
                _.forOwn(injectionOptionsResponse.hostInjections, function (injectionOptionsEntries, nodeID) {
                    console.log(nodeID);
                    _.forOwn(injectionOptionsEntries, function (injectionOptionContent, injectionOptionKey) {
                        console.log(injectionOptionKey);
                        options.push(injectionOptionContent);
                    });
                    const injectionEntry = new InjectionOption();
                    injectionEntry.nodeID = nodeID;
                    injectionEntry.injectionOptionTopologyFragments = options;
                    injectionOptionEntries.push(injectionEntry);
                    options = [];
                });
                injectionOptions.hostInjectionOptions = injectionOptionEntries;
                injectionOptionEntries = [];
                _.forOwn(injectionOptionsResponse.connectionInjections, function (injectionOptionsEntries, nodeID) {
                    console.log(nodeID);
                    _.forOwn(injectionOptionsEntries, function (injectionOptionContent, injectionOptionKey) {
                        console.log(injectionOptionKey);
                        options.push(injectionOptionContent);
                    });
                    const injectionEntry = new InjectionOption();
                    injectionEntry.nodeID = nodeID;
                    injectionEntry.injectionOptionTopologyFragments = options;
                    injectionOptionEntries.push(injectionEntry);
                    options = [];
                });
                injectionOptions.connectionInjectionOptions = injectionOptionEntries;
                this.logger.log('[deployment-completion.service][getInjectionOptions]', 'Received injection optioins: ' + injectionOptions);
                return injectionOptions;
            })
            .catch(err => {
                if (err.status === 400) {
                    return null;
                } else {
                    this.logger.handleError('[deployment-completion.service][getInjectionOptions]',
                        err);
                }
            });
    }

    injectNewHosts(serviceTemplateURL: string, completionSelection: any): Promise<any> {
        const postURL = new Path(serviceTemplateURL)
            .append('injector')
            .append('replace')
            .toString();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            observe: 'response'
        };
        this.logger.log('[deployment-completion.service][injectNewHosts][request-url]', JSON.stringify(postURL));

        // Todo Check if observe: 'response' works to get the whole response including headers (https://angular.io/guide/http)
        // @ts-ignore
        return this.http.post<HttpResponse<any>>(postURL, completionSelection, httpOptions)
            .toPromise()
            .then(response => {
                const injectedserviceTemplateURL = response.headers.get('Location') as string;
                this.logger.log('[deployment-completion.service][injectNewHosts][response-location]', response.headers.get('Location'));
                return injectedserviceTemplateURL;
            });
    }

    getAppFromCompletionHandlerWinery(serviceTemplateUrl: string, appId: string): Promise<MarketplaceApplication> {
        const selfServiceURL = new Path(serviceTemplateUrl)
            .append('selfserviceportal')
            .toString();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<MarketplaceApplication>(selfServiceURL, httpOptions)
            .toPromise()
            .then(response => {
                const app = response;
                app.iconUrl = selfServiceURL + '/' + app.iconUrl;
                app.imageUrl = selfServiceURL + '/' + app.imageUrl;
                app.csarURL = selfServiceURL.substr(0, selfServiceURL.lastIndexOf('/selfserviceportal')) + '?csar';
                app.repositoryURL = serviceTemplateUrl;
                app.id = appId;
                app.isInstalling = false;
                if (!app.displayName || app.displayName === '') {
                    app.displayName = appId;
                }
                this.logger.log('[deployment-completion.service][getAppFromCompletionHandlerWinery] Received app from repo: ', JSON.stringify(app));
                return app;
            })
            .catch(err => this.logger.handleError('[deployment-completion.service][getAppFromCompletionHandlerWinery]', err));
    }
}

