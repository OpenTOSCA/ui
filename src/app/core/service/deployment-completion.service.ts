/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Karoline Saatkamp - initial implementation
 */

import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import * as _ from 'lodash';
import {OpenToscaLoggerService} from './open-tosca-logger.service';

@Injectable()
export class DeploymentCompletionService {

    constructor(private http: Http,
                private logger: OpenToscaLoggerService) {
    }

    getInjectionOptions(serviceTemplateURL: string): Promise<any> {
        const postURL = serviceTemplateURL + '/injector/options';
        const headers = new Headers({'Accept': 'application/json'});

        return this.http.get(postURL, {headers: headers})
            .toPromise()
            .then(response => {
                console.log('InjectionOption Winery Response:');
                console.log(response.json());
                const injectionOptionsResponse = response.json();
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
        const headers = new Headers({'Content-Type': 'application/json'});
        this.logger.log('[deployment-completion.service][injectNewHosts][request-url]', JSON.stringify(postURL));

        return this.http.post(postURL, completionSelection, {headers: headers})
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
        return this.http.get(selfServiceURL, {headers: headers})
            .toPromise()
            .then(response => {
                const app = response.json() as MarketplaceApplication;
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

