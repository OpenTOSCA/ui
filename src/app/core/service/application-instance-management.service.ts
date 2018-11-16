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
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { ApplicationManagementService } from './application-management.service';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Csar } from '../model/csar.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceTemplateList } from '../model/service-template-list.model';
import { ServiceTemplate } from '../model/service-template.model';
import { ServiceTemplateInstanceList } from '../model/service-template-instance-list.model';
import { PlanInstance } from '../model/plan-instance.model';
import { Plan } from '../model/plan.model';

@Injectable()
export class ApplicationInstanceManagementService {

    constructor(private logger: LoggerService,
                private http: HttpClient,
                private applicationManagementService: ApplicationManagementService) {
    }

    getServiceTemplateInstance(appId: string, instanceId: string): Observable<ServiceTemplateInstance> {
        return this.applicationManagementService.getCsar(appId)
            .pipe(
                mergeMap(app => {
                    return this.getServiceTemplateInstancesOfCsar(app);
                }),
                map(instances => {
                    const ary = Array.from(instances.values());
                    for (const instance of ary) {
                        if (instance.id === +instanceId) {
                            return instance;
                        }
                    }
                })
            );
    }

    getBuildPlanInstanceFromServiceTemplateInstance(serviceTemplateInstance: ServiceTemplateInstance): Observable<PlanInstance> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<PlanInstance>(serviceTemplateInstance._links['build_plan_instance'].href, httpOptions)
            .pipe(
                catchError(err => {
                    console.error(err);
                    return throwError(err);
                })
            );
    }

    getManagementPlans(serviceTemplateInstance: ServiceTemplateInstance): Observable<Array<Plan>> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<{ plans: Array<Plan> }>(serviceTemplateInstance._links['managementplans'].href, httpOptions)
            .pipe(
                map(result => result.plans),
                catchError(err => {
                    console.error(err);
                    return throwError(err);
                })
            );

    }

    getPlanInstancesOfPlan(plan: Plan): Observable<Array<PlanInstance>> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<{ plan_instances: Array<PlanInstance> }>(plan._links['instances'].href, httpOptions)
            .pipe(
                map(result => {
                    return result.plan_instances;
                })
            );
    }

    getPlanInstancesOfServiceTemplateInstance(app: Csar,
                                              serviceTemplateInstance: ServiceTemplateInstance): Observable<Array<PlanInstance>> {
        return forkJoin(
            this.getBuildPlanInstanceFromServiceTemplateInstance(serviceTemplateInstance),
            this.getManagementPlans(serviceTemplateInstance)
                .pipe(
                    mergeMap(plans => {
                        const obs = [];

                        for (const plan of plans) {
                            obs.push(this.getPlanInstancesOfPlan(plan));
                        }
                        return forkJoin(obs)
                            .pipe(
                                map(result => {
                                    // we got an array of plan instances for each plan, so we have to merge all these arrays to one
                                    let resultAry: Array<PlanInstance> = [];
                                    for (const instAry of result) {
                                        resultAry = resultAry.concat(instAry);
                                    }
                                    return resultAry;
                                })
                            );
                    }),
                    catchError(err => this.logger.handleObservableError(
                        '[application-instance-management.service][getManagementPlans]', err))
                )
        ).pipe(
            map(result => new Array(result[0]).concat(result[1]))
        );
    }

    getServiceTemplateInstancesOfCsar(app: Csar): Observable<Map<string, ServiceTemplateInstance>> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<ServiceTemplateList>(app._links['servicetemplates'].href)
            .pipe(
                mergeMap(response => {
                    return this.http.get<ServiceTemplate>(response.service_templates[0]._links['self'].href, httpOptions)
                        .pipe(
                            mergeMap(serviceTemplate => {
                                return this.http.get<ServiceTemplateInstanceList>(serviceTemplate._links['instances'].href, httpOptions)
                                    .pipe(
                                        mergeMap(instanceList => {
                                            const obs: Array<Observable<ServiceTemplateInstance>> = [];
                                            for (const entry of instanceList.service_template_instances) {
                                                obs.push(this.http.get<ServiceTemplateInstance>(entry._links['self'].href, httpOptions));
                                            }
                                            return forkJoin(obs)
                                                .pipe(
                                                    map(instances => {
                                                        const m = new Map<string, ServiceTemplateInstance>();
                                                        for (const inst of instances) {
                                                            m.set(inst.id.toString(), inst);
                                                        }
                                                        return m;
                                                    })
                                                );
                                        }),
                                        catchError(reason => this.logger.handleError(
                                            '[application-instances.service][getServiceTemplateInstances][fetching instances]',
                                            reason))
                                    );
                            }),
                            catchError(reason => this.logger.handleError(
                                '[application-instances.service][getServiceTemplateInstances][fetching service template]',
                                reason))
                        );
                }),
                catchError(reason => this.logger.handleError(
                    '[application-instances.service][getServiceTemplateInstances][fetching service template list]',
                    reason))
            );
    }
}
