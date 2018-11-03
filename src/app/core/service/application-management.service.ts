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
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { Path } from '../util/path';
import * as _ from 'lodash';
import { CsarList } from '../model/csar-list.model';
import { Csar } from 'app/core/model/csar.model';
import { Plan } from '../model/plan.model';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { Interface } from '../model/interface.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';

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

    constructor(private http: HttpClient,
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
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(url, httpOptions)
            .pipe(
                map((response: CsarList) => {
                    const observables: Array<Observable<Csar>> = [];
                    for (const entry of response.csars) {
                        observables.push(this.http.get<Csar>(entry._links['self'].href, httpOptions));
                    }
                    return observables.length > 0 ? forkJoin(observables) : of([]);
                }),
                flatMap(result => result)
            )
    }

    /**
     * Lookup the parameters required by the buildplan of a CSAR
     * @param appID
     * @returns {Observable<Plan>}
     */
    getBuildPlan(appID: string): Observable<Plan> {
        return this.getServiceTemplatePathNG(appID)
            .pipe(
                flatMap(serviceTemplatePath => {
                    const url = new Path(serviceTemplatePath)
                        .append('buildplans')
                        .toString();
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Accept': 'application/json'
                        })
                    };
                    // const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
                    return this.http.get(url, httpOptions)
                    // Todo For now it is okay to fetch the first build plan but we have to keep this in mind
                        .pipe(
                            map(response => response['plans'][0] as Plan),
                            catchError(err => {
                                this.logger.handleObservableError('[application.service][getBuildPlan]', err);
                                return throwError(err);
                            })
                        )
                }),
                catchError(err => {
                    this.logger.handleObservableError('[application.service][getBuildPlan]', err);
                    return throwError(err);
                })
            )
    }

    getTerminationPlan(appID: string): Observable<Plan> {
        return this.getServiceTemplatePathNG(appID)
            .pipe(
                flatMap(serviceTemplatePath => {
                    const url = new Path(serviceTemplatePath)
                        .append('boundarydefinitions')
                        .append('interfaces')
                        .append(this.ngRedux.getState().administration.opentoscaLifecycleInterfaceName)
                        .toString();
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Accept': 'application/json'
                        })
                    };
                    return this.http.get(url, httpOptions)
                        .pipe(
                            map(response => response as Interface),
                            map((i: Interface) => {
                                return i.operations[this.ngRedux.getState().administration.terminationOperationName]
                                    ._embedded.plan;
                                }),
                            catchError(err => {
                                this.logger.handleObservableError('[application.service][getTerminationPlan]', err);
                                return throwError(err);
                            })
                        )
                }),
                catchError(err => {
                    this.logger.handleObservableError('[application.service][getTerminationPlan]', err);
                    return throwError(err);
                })
            )
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
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };

        return this.http.get(url, httpOptions)
            .pipe(
                map(response => {
                    return response['service_templates'][0]._links['self'].href;
                }),
                catchError(err => this.logger.handleObservableError('[application.service][getServiceTemplatePath]', err))
            )
    }

    /**
     * Triggers the termination of an service template instance
     *
     * TODO REMOVE
     * @deprecated
     * @param plan
     * @returns {Observable<string>}
     */
    triggerTerminationPlan(plan: Plan): Observable<string> {
        const url = new Path(plan._links['self'].href)
            .append('instances')
            .toString();
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.post(url, [], httpOptions)
            .pipe(
                map((response: Response) => {
                    this.logger.log('[application-management.service][triggerTerminationPlan]', 'Result: ' + response);
                    return response.headers['Location'];
                }),
                catchError(err => this.logger.handleError('[application-management.service][triggerTerminationPlan]', err))
            )
    }

    /**
     * Triggers the given management plan
     * @param plan Plan object that containes required input parameters for the buildplan
     * @returns {Observable<string>}
     */
    triggerManagementPlan(plan: Plan): Observable<string> {
        this.logger.log('[application-management.service][triggerManagementPlan]',
            'Starting Management Plan <' + plan.id + '>');
        this.logger.log('[application-management.service][triggerManagementPlan]',
            'Build Plan Operation Meta Data are: ' + JSON.stringify(plan));
        const url = new Path(plan._links['self'].href)
            .append('instances')
            .toString();

        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };

        return this.http.post(url, plan.input_parameters, httpOptions)
            .pipe(
                map((response: Response) => {
                    this.logger.log('[application.service][triggerBuildPlan]', 'Response headers are: ' + response.headers);
                    return response.headers['Location'];
                }),
                catchError(err => this.logger.handleError('[application.service][triggerBuildPlan]', err))
            )
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
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(csarUrl, httpOptions)
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
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<Csar>(url, httpOptions)
            .pipe(
                catchError((err: any) => {
                    this.logger
                        .handleObservableError('[application.service][getCsarDescriptionByCsarID]', err);
                    return throwError(err);
                })
            )
    }
}
