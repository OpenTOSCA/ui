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
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { Csar } from '../../core/model/csar.model';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { Plan } from '../../core/model/plan.model';
import { Interface } from '../../core/model/interface.model';
import { PlanTypes } from '../../core/model/plan-types.model';
import { select } from '@angular-redux/store';

@Injectable()
export class ApplicationDetailResolverService implements Resolve<{ csar: Csar, buildPlan: Plan, terminationPlan: Plan, interfaces: Interface[] }> {

    @select(['administration', 'planLifecycleInterface']) planLifecycleInterface: Observable<string>;
    private planInterface: string;
    @select(['administration', 'planOperationInitiate']) planOperationInitiate: Observable<string>;
    private planInitiate: string;
    @select(['administration', 'planOperationTerminate']) planOperationTerminate: Observable<string>;
    private planTerminate: string;

    constructor(private applicationService: ApplicationManagementService, private logger: LoggerService,) {
        this.planLifecycleInterface.subscribe(value => this.planInterface = value);
        this.planOperationInitiate.subscribe(value => this.planInitiate = value);
        this.planOperationTerminate.subscribe(value => this.planTerminate = value);
    }

    resolve(route: ActivatedRouteSnapshot): Observable<{ csar: Csar, buildPlan: Plan, terminationPlan: Plan, interfaces: Interface[] }> {
        return forkJoin(
            this.applicationService.getCsar(route.params['id']),
            this.applicationService.getInterfaces(route.params['id'])
                .pipe(
                    catchError(() => of(null))
                ),
        )
            .pipe(
                mergeMap(result => {
                    const interfaces = <Interface[]>result[1];
                    let buildPlan: Plan = null;
                    let terminationPlan: Plan = null;

                    const defaultInterface = interfaces.find(value => value.name === this.planInterface);
                    defaultInterface.operations.forEach(operation => {
                        const plan = operation._embedded.plan;
                        if (operation.name === this.planInitiate && plan.plan_type === PlanTypes.BuildPlan && !buildPlan) {
                            buildPlan = plan;
                        } else if (operation.name === this.planTerminate && plan.plan_type === PlanTypes.TerminationPlan && !terminationPlan) {
                            terminationPlan = plan;
                        }
                    });

                    return of({
                        csar: result[0], buildPlan: buildPlan, terminationPlan: terminationPlan, interfaces: interfaces
                    });
                }),
                catchError(reason => {
                    return this.logger.handleError('[application-detail-resolver.service][resolve]', reason);
                })
            );
    }
}
