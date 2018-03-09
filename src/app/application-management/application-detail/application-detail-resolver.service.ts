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
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { Csar } from '../../core/model/csar.model';
import { Plan } from '../../core/model/plan.model';

@Injectable()
export class ApplicationDetailResolverService {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Csar> {
        return this.appService.getCsarDescriptionByCsarID(route.params['id']).catch(reason => {
            return this.logger.handleError('[application-details-resolver.service][resolve]', reason);
        });
    }

    constructor(private appService: ApplicationManagementService, private logger: OpenToscaLoggerService) {
    }
}
