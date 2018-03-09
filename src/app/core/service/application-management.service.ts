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
 *     Michael Wurster - initial implementation
 */

import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { Path } from '../util/path';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { CsarList } from '../model/csar-list.model';
import { Csar } from 'app/core/model/csar.model';
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { Plan } from '../model/plan.model';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { Interface } from '../model/interface.model';

@Injectable()
export class ApplicationManagementService {
    /**
     * Helper that ensures that appID always ends with .csar
     * @param appID
     * @returns {string}
     */
    public fixAppID(appID: string): string {
        return _.endsWith(appID.toLowerCase(), '.csar') ? appID : appID + '.csar';
    }

    constructor(private http: Http,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService) {
    }

    /**
     * Deletes the app from the container
     * @param appID
     * @returns {Observable<any>}
     */
    deleteAppFromContainer(appID: string): Observable<any> {
        const url = new Path(this.ngRedux.getState().administration.containerAPI)
            .append('csars')
            .append(this.fixAppID(appID))
            .toString();
        this.logger.log('[application.service][deleteAppFromContainer]', 'Sending delete to ' + url);
        return this.http.delete(url);
    }

    /**
     * Load meta data of all CSARs from container
     * @returns {Observable<Array<Csar>>}
     */
    getResolvedApplications(): Observable<Array<Csar>> {
        const url = new Path(this.ngRedux.getState().administration.containerAPI)
            .append('csars')
            .toString();
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(url, reqOpts)
            .map((response: Response) => response.json())
            .map((response: CsarList) => {
                const observables: Array<Observable<Csar>> = [];
                for (const entry of response.csars) {
                    observables.push(this.http.get(entry._links['self'].href, reqOpts)
                        .map((rawCsar: Response) => rawCsar.json())
                    );
                }
                return observables.length > 0 ? Observable.forkJoin(observables) : Observable.of([]);
            })
            .flatMap(result => result);
    }

    /**
     * Lookup the parameters required by the buildplan of a CSAR
     * @param appID
     * @returns {Observable<Plan>}
     */
    getBuildPlan(appID: string): Observable<Plan> {
        return this.getServiceTemplatePathNG(appID)
            .flatMap(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath)
                    .append('buildplans')
                    .toString();
                const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
                return this.http.get(url, reqOpts)
                // Todo For now it is okay to fetch the first build plan but we have to keep this in mind
                    .map(response => response.json()['plans'][0] as Plan)
                    .catch(err => this.logger.handleObservableError('[application.service][getBuildPlan]', err));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getBuildPlan]', err));
    }

    getTerminationPlan(appID: string): Observable<Plan> {
        return this.getServiceTemplatePathNG(appID)
            .flatMap(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath)
                    .append('boundarydefinitions')
                    .append('interfaces')
                    .append(this.ngRedux.getState().administration.opentoscaLifecycleInterfaceName)
                    .toString();
                const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
                return this.http.get(url, reqOpts)
                    .map((response: Response) => response.json() as Interface)
                    .map((i: Interface) => {
                        return i.operations[this.ngRedux.getState().administration.terminationOperationName]
                            ._embedded.plan;
                    })
                    .catch(err => this.logger.handleObservableError('[application.service][getTerminationPlan]', err));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getTerminationPlan]', err));
    }

    /**
     * Fetches the URL to the ServiceTemplate of the given AppID
     * @param appID
     * @returns {Observable<string>}
     */
    getServiceTemplatePathNG(appID: string): Observable<string> {

        const url = new Path(this.ngRedux.getState().administration.containerAPI)
            .append('csars')
            .append(this.fixAppID(appID))
            .append('servicetemplates')
            .toString();

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.http.get(url, reqOpts)
            .map(response => {
                return response.json().service_templates[0]._links['self'].href;
            })
            .catch(err => this.logger.handleObservableError('[application.service][getServiceTemplatePath]', err));
    }

    /**
     * Triggers the termination of an service template instance
     * @param plan
     * @returns {Observable<string>}
     */
    triggerTerminationPlan(plan: Plan): Observable<string> {
        const url = new Path(plan._links['self'].href)
            .append('instances')
            .toString();
        return this.http.post(url, [], {headers: new Headers({'Accept': 'application/json'})})
            .map((response: Response) => {
                this.logger.log('[application-management.service][triggerTerminationPlan]', 'Result: ' + response);
                return response.headers['Location'];
            })
            .catch(err => this.logger.handleError('[application-management.service][triggerTerminationPlan]', err));
    }

    /**
     * Triggers the provisioning of a new service instance
     * @param plan PlanParameters object that containes required input parameters for the buildplan
     * @returns {Promise<BuildplanPollResource>}
     */
    triggerBuildPlan(plan: Plan): Observable<string> {
        this.logger.log('[application.service][triggerBuildPlan]', 'Starting Provisioning');
        this.logger.log('[application.service][triggerBuildPlan]', 'Build Plan Operation Meta Data are: ' + JSON.stringify(plan));
        const url = new Path(plan._links['self'].href)
            .append('instances')
            .toString();
        this.logger.log('[application.service][triggerBuildPlan]', 'Posting to: ' + url);

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.http.post(url, plan.input_parameters, reqOpts)
            .map((response: Response) => {
                this.logger.log('[application.service][triggerBuildPlan]', 'Response headers are: ' + response.headers);
                return response.headers['Location'];
            })
            .catch(err => this.logger.handleError('[application.service][triggerBuildPlan]', err));
    }

    /**
     * Checks if an App with given appID is already deployed in container.
     * Returns true if already deployed and false if not, so be sure to handle this in <then callback>
     * @param appID
     * @returns {Promise<boolean>}
     */
    isAppDeployedInContainer(appID: string): Promise<boolean> {
        appID = this.fixAppID(appID);

        const csarUrl = new Path(this.ngRedux.getState().administration.containerAPI)
            .append('csars')
            .append(appID)
            .toString();
        const headers = new Headers({'Accept': 'application/json'});
        return this.http.get(csarUrl, {headers: headers})
            .toPromise()
            .then(response => true)
            .catch(reason => false);
    }

    /**
     * Retrieve csar description of given CSAR ID
     * @param csarID CSAR ID (e.g. XYZ.csar)
     * @returns {Observable<Csar>}
     */
    getCsarDescriptionByCsarID(csarID: string): Observable<Csar> {
        csarID = this.fixAppID(csarID);
        const url = new Path(this.ngRedux.getState().administration.containerAPI)
            .append('csars')
            .append(csarID)
            .toString();
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(url, reqOpts)
            .map((response: Response) => response.json() as Csar)
            .catch((err: any) => this.logger
                .handleObservableError('[application.service][getCsarDescriptionByCsarID]', err));
    }
}
