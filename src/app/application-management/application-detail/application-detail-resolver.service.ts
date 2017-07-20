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
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ApplicationDetail } from '../../core/model/application-detail.model';
import { PlanOperationMetaData } from '../../core/model/planOperationMetaData.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { Csar } from '../../core/model/new-api/csar.model';
import { Plan } from '../../core/model/new-api/plan.model';

@Injectable()
export class ApplicationDetailResolverService {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ApplicationDetail> {
        return Observable.forkJoin(
            [
                this.appService.getCsarDescriptionByCsarID(route.params['id']).retry(3),
                this.appService.getBuildPlan(route.params['id']).retry(3),
                this.appService.getTerminationPlan(route.params['id']).retry(3)
            ]
        )
            .map((result: Array<any>) => new ApplicationDetail(
                <Csar>result[0],
                <Plan>result[1],
                <PlanOperationMetaData>result[2]
                )
            )
            .catch(reason => {
                return this.logger.handleError('[application-details-resolver.service][resolve]', reason);
            });
    }

    constructor(private appService: ApplicationManagementService, private logger: OpenToscaLoggerService) {
    }
}
