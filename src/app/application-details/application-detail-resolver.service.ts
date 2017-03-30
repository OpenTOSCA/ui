/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApplicationService } from '../shared/application.service';
import { ApplicationDetail } from '../shared/model/application-detail.model';
import { OpenToscaLogger } from '../shared/helper/OpenToscaLogger';
import { Observable } from 'rxjs';

@Injectable()
export class ApplicationDetailResolver implements Resolve<ApplicationDetail> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ApplicationDetail> {
        return Observable.forkJoin(
            [
                this.appService.getAppDescription(route.params['id']).retry(3),
                this.appService.getBuildPlanParameters(route.params['id']).retry(3),
                this.appService.getTerminationPlan(route.params['id']).retry(3)
            ]
        )
        .map(result => new ApplicationDetail(result[0], result[1], result[2]))
        .catch(reason => {
            return this.logger.handleError('[application-details-resolver.service][resolve]', reason)
        });
    }

    constructor(private appService: ApplicationService, private logger: OpenToscaLogger) {
    }
}
