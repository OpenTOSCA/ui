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

@Injectable()
export class ApplicationDetailResolverService implements Resolve<{ csar: Csar, buildPlan: Plan, terminationPlan: Plan }> {

    constructor(private applicationService: ApplicationManagementService, private logger: LoggerService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<{ csar: Csar, buildPlan: Plan, terminationPlan: Plan }> {
        return forkJoin(
            this.applicationService.getCsar(route.params['id']),
            this.applicationService.getBuildPlan(route.params['id'])
                .pipe(
                    catchError(() => of(null))
                ),
            this.applicationService.getTerminationPlan(route.params['id'])
                .pipe(
                    catchError(() => of(null))
                )
        )
        .pipe(
            mergeMap(result => {
                return of({csar: result[0], buildPlan: result[1], terminationPlan: result[2]});
            }),
            catchError(reason => {
                return this.logger.handleError('[application-detail-resolver.service][resolve]', reason);
            }))

        // return this.applicationService.getCsar(route.params['id'])
        //     .pipe(
        //         catchError(reason => {
        //             return this.logger.handleError('[application-detail-resolver.service][resolve]', reason);
        //         })
        //     );
    }
}
