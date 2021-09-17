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
import { Interface } from '../../core/model/interface.model';
import { PlanTypes } from '../../core/model/plan-types.model';

interface ResolverOutput {
    csar: Csar;
    buildPlanAvailable: boolean;
    terminationPlanAvailable: boolean;
    interfaces: Interface[];
}

@Injectable()
export class ApplicationDetailResolverService implements Resolve<{ csar: Csar, interfaces: Interface[] }> {

    constructor(private applicationService: ApplicationManagementService, private logger: LoggerService, ) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<ResolverOutput> {
        return forkJoin(
            this.applicationService.getCsar(route.params['id']),
            this.applicationService.getInterfaces(route.params['id']),
        )
            .pipe(
                mergeMap(result => {
                    const interfaces = <Interface[]>result[1];

                    const buildPlanExists = interfaces.find(value =>
                        !!value.operations.find(operation => operation._embedded.plan.plan_type === PlanTypes.BuildPlan)
                    );
                    const terminationPlanExists = interfaces.find(value =>
                        !!value.operations.find(operation => operation._embedded.plan.plan_type === PlanTypes.TerminationPlan)
                    );

                    return of({
                        csar: result[0], buildPlanAvailable: !!buildPlanExists,
                        terminationPlanAvailable: !!terminationPlanExists, interfaces: interfaces
                    });
                }),
                catchError(reason => {
                    return this.logger.handleError('[application-detail-resolver.service][resolve]', reason);
                })
            );
    }
}
