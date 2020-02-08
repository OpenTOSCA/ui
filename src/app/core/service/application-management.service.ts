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
import { Interface } from '../model/interface.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import { InterfaceList } from '../model/interface-list.model';
import { Operation } from '../model/operation.model';
import { NodeTemplateResultObject } from '../model/node-template-result.model';

@Injectable()
export class ApplicationManagementService {

    private httpOptionsAcceptJson = {
        headers: new HttpHeaders({
            'Accept': 'application/json'
        })
    };

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
        return this.http.get(url, this.httpOptionsAcceptJson)
            .pipe(
                map((response: CsarList) => {
                    const observables: Array<Observable<Csar>> = [];
                    for (const entry of response.csars) {
                        observables.push(this.http.get<Csar>(entry._links['self'].href, this.httpOptionsAcceptJson));
                    }
                    return observables.length > 0 ? forkJoin(observables) : of([]);
                }),
                flatMap(result => result)
            );
    }

    getInterfaces(csarId: string): Observable<Interface[]> {
        return this.getFirstServiceTemplateOfCsar(csarId)
            .pipe(
                flatMap(serviceTemplatePath => {
                    const url = new Path(serviceTemplatePath)
                        .append('boundarydefinitions')
                        .append('interfaces')
                        .toString();
                    return this.http.get<InterfaceList>(url, this.httpOptionsAcceptJson)
                        .pipe(
                            flatMap(element => {
                                const interfacesList: Observable<Interface>[] = [];
                                for (const iface of element.interfaces) {
                                    const operationsUrl = new Path(iface._links['self'].href)
                                        .toString();
                                    interfacesList.push(this.http.get<Interface>(operationsUrl, this.httpOptionsAcceptJson));
                                }
                                return forkJoin(...interfacesList)
                                    .pipe(
                                        map((result) => {
                                            const interfaces: Array<Interface> = [];
                                            for (const i of result) {
                                                const iface = new Interface();
                                                iface.name = i.name;
                                                for (const key of Object.keys(i.operations)) {
                                                    const opp = new Operation();
                                                    opp.name = key;
                                                    opp._embedded = i.operations[key]._embedded;
                                                    iface.operations.push(opp);
                                                }
                                                interfaces.push(iface);
                                            }
                                            return interfaces;
                                        })
                                    );
                            }),
                            catchError(err => {
                                this.logger.handleObservableError('[application.service][getInterfaces]', err);
                                return throwError(err);
                            })
                        );
                }),
                catchError(err => {
                    this.logger.handleObservableError('[application.service][getInterfaces]', err);
                    return throwError(err);
                })
            );
    }

    getNodeTemplatesOfServiceTemplate(serviceTemplatePath: string): Observable<NodeTemplateResultObject> {
        const url = new Path(serviceTemplatePath)
            .append('nodetemplates')
            .toString();
        return this.http.get<NodeTemplateResultObject>(url, this.httpOptionsAcceptJson);
    }

    getFirstServiceTemplateOfCsar(csarId: string): Observable<string> {
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(this.normalizeApplicationId(csarId))
            .append('servicetemplates')
            .toString();
        return this.http.get(url, this.httpOptionsAcceptJson)
            .pipe(
                map(response => {
                    return response['service_templates'][0]._links['self'].href;
                }),
                catchError(err => this.logger.handleObservableError('[application.service][getFirstServiceTemplateOfCsar]', err))
            );
    }

    getPropertiesOfNodeTemplate(serviceTemplateURL: string, nodeTemplateId: string): Observable<any> {
        const url = serviceTemplateURL + '/nodetemplates/' + nodeTemplateId + '/properties';
        return this.http.get(url, this.httpOptionsAcceptJson);
    }

    triggerManagementPlan(plan: Plan, instanceId: string): Observable<string> {
        this.logger.log('[application-management.service][triggerManagementPlan]',
            'Starting Management Plan <' + plan.id + '>');
        this.logger.log('[application-management.service][triggerManagementPlan]',
            'Build Plan Operation Meta Data are: ' + JSON.stringify(plan));
        let url = new Path(plan._links['self'].href)
            .append('instances')
            .toString();

        if (instanceId) {
            url = _.replace(url, ':id', instanceId);
        }

        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'text/plain'
            }),
        };
        return this.http.post(url, plan.input_parameters, { ...httpOptions, responseType: 'text', observe: 'response' })
            .pipe(
                map(response => {
                    return response.headers.get('Location');
                }),
                catchError(err => this.logger.handleError('[application.service][triggerManagementPlan]', err))
            );
    }

    isApplicationInstalled(id: string): Promise<boolean> {
        id = this.normalizeApplicationId(id);
        const csarUrl = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(id)
            .toString();
        return this.http.get(csarUrl, this.httpOptionsAcceptJson)
            .toPromise()
            .then(() => true)
            .catch(() => false);
    }

    getNodeTemplateInstanceProperties(serviceTemplateURL: string, nodeTemplateId: string, nodeTemplateInstanceId: string): Observable<any> {
        const url = serviceTemplateURL + '/nodetemplates/' + nodeTemplateId + '/instances/' + nodeTemplateInstanceId + '/properties';
        return this.http.get(url, this.httpOptionsAcceptJson);
    }

    getCsar(csarId: string): Observable<Csar> {
        csarId = this.normalizeApplicationId(csarId);
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(csarId)
            .toString();
        return this.http.get<Csar>(url, this.httpOptionsAcceptJson)
            .pipe(
                catchError((err: any) => {
                    this.logger
                        .handleObservableError('[application.service][getCsar]', err);
                    return throwError(err);
                })
            );
    }
}
