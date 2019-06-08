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
import { LoggerService } from './logger.service';
import { Path } from '../path';
import * as _ from 'lodash';
import { CsarList } from '../model/csar-list.model';
import { Csar } from '../model/csar.model';
import { Plan } from '../model/plan.model';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { PlacementCandidate } from './../model/placement.model';
import { Interface } from '../model/interface.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';

@Injectable()
export class ApplicationManagementService {

    constructor(private http: HttpClient, private ngRedux: NgRedux<AppState>,
                private logger: LoggerService) {
    }

    public normalizeApplicationId(csarId: string): string {
        return _.endsWith(csarId.toLowerCase(), '.csar') ? csarId : csarId + '.csar';
    }

    deleteApplication(csarId: string): Observable<any> {
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(this.normalizeApplicationId(csarId))
            .toString();
        this.logger.log('[application.service][deleteApplication]', 'Sending delete to ' + url);
        return this.http.delete(url);
    }

    getResolvedApplications(): Observable<Array<Csar>> {
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
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
            );
    }

    getBuildPlan(csarId: string): Observable<Plan> {
        return this.getFirstServiceTemplateOfCsar(csarId)
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
                    // Todo For now it is okay to fetch the first build plan but we have to keep this in mind
                    return this.http.get(url, httpOptions)
                        .pipe(
                            map(response => response['plans'][0] as Plan),
                            catchError(err => {
                                this.logger.handleObservableError('[application.service][getBuildPlan]', err);
                                return throwError(err);
                            })
                        );
                }),
                catchError(err => {
                    this.logger.handleObservableError('[application.service][getBuildPlan]', err);
                    return throwError(err);
                })
            );
    }

    getTerminationPlan(csarId: string): Observable<Plan> {
        return this.getFirstServiceTemplateOfCsar(csarId)
            .pipe(
                flatMap(serviceTemplatePath => {
                    const url = new Path(serviceTemplatePath)
                        .append('boundarydefinitions')
                        .append('interfaces')
                        .append(this.ngRedux.getState().administration.planLifecycleInterface)
                        .toString();
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Accept': 'application/json'
                        })
                    };
                    return this.http.get<Interface>(url, httpOptions)
                        .pipe(
                            map(i => {
                                return i.operations[this.ngRedux.getState().administration.planOperationTerminate]
                                    ._embedded.plan;
                            }),
                            catchError(err => {
                                this.logger.handleObservableError('[application.service][getTerminationPlan]', err);
                                return throwError(err);
                            })
                        );
                }),
                catchError(err => {
                    this.logger.handleObservableError('[application.service][getTerminationPlan]', err);
                    return throwError(err);
                })
            );
    }

    getFirstServiceTemplateOfCsar(csarId: string): Observable<string> {
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(this.normalizeApplicationId(csarId))
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
                catchError(err => this.logger.handleObservableError('[application.service][getFirstServiceTemplateOfCsar]', err))
            );
    }

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
                'Accept': 'text/plain'
            }),
        };
        return this.http.post(url, plan.input_parameters, {...httpOptions, responseType: 'text', observe: 'response'})
            .pipe(
                map(response => {
                    return response.headers.get('Location');
                }),
                catchError(err => this.logger.handleError('[application.service][triggerManagementPlan]', err))
            );
    }

    initiatePlacementOperation(csar: Csar): Observable<PlacementCandidate> {
        this.logger.log('[application-management.service][initiatePlacementOperation]',
            'Starting Placement Operation for application');

        const url = new Path(csar._links['servicetemplate'].href).append('placement').toString();
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            }),
        };

        return this.http.post(url, {'doesnt': 'matter'}, {...httpOptions, responseType: 'json', observe: 'response'})
            .pipe(
                map(response => {

                    const placementCandidate: PlacementCandidate = response.body as PlacementCandidate;

                    return placementCandidate;
                    // return response.headers.get('Location');
                }),
                catchError(err => this.logger.handleError('[application.service][initiatePlacementOperation]', err))
            );
    }

    isApplicationInstalled(id: string): Promise<boolean> {
        id = this.normalizeApplicationId(id);
        const csarUrl = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(id)
            .toString();
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(csarUrl, httpOptions)
            .toPromise()
            .then(() => true)
            .catch(() => false);
    }

    getCsar(csarId: string): Observable<Csar> {
        csarId = this.normalizeApplicationId(csarId);
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(csarId)
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
                        .handleObservableError('[application.service][getCsar]', err);
                    return throwError(err);
                })
            );
    }
}
