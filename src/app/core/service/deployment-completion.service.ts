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

import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {OpenToscaLoggerService} from './open-tosca-logger.service';
import { MarketplaceApplication } from '../model/marketplace-application.model';
import { InjectionOption } from '../model/injection-option.model';
import { InjectionOptions } from '../model/injection-options.model';
import { TopologyTemplate } from '../model/topology-template.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable()
export class DeploymentCompletionService {

    constructor(private http: HttpClient,
                private logger: OpenToscaLoggerService) {
    }

    getInjectionOptions(serviceTemplateURL: string): Promise<any> {
        const postURL = serviceTemplateURL + '/injector/options';
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(postURL, httpOptions)
            .toPromise()
            .then(response => {
                console.log('InjectionOption Winery Response:');
                console.log(response);
                const injectionOptionsResponse = response;
                const injectionOptions = new InjectionOptions();
                let injectionOptionEntries = [] as InjectionOption[];
                let options = [] as TopologyTemplate[];
                _.forOwn(injectionOptionsResponse['hostInjections'], function (injectionOptionsEntries, nodeID) {
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
                _.forOwn(injectionOptionsResponse['connectionInjections'], function (injectionOptionsEntries, nodeID) {
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
                console.log('The stored objects:');
                console.log(injectionOptions);
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
        const postURL = serviceTemplateURL + '/injector/replace';
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
        const selfServiceURL = serviceTemplateUrl + '/selfserviceportal';
        const headers = new Headers({'Accept': 'application/json'});
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
                console.log(app);
                return app;
            })
            .catch(err => this.logger.handleError('[deployment-completion.service][getAppFromCompletionHandlerWinery]', err));
    }
}

