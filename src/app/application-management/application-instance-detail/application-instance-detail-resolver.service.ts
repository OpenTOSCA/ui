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
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { LoggerService } from '../../core/service/logger.service';
import { ApplicationInstanceManagementService } from '../../core/service/application-instance-management.service';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApplicationInstanceDetailResolverService implements Resolve<ServiceTemplateInstance> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServiceTemplateInstance> {
        return this.appInstService.getServiceTemplateInstance(route.params['id'], route.params['instanceId'])
            .pipe(
                catchError(reason => {
                    return this.logger.handleError('[application-instance-details-resolver.service][resolve]', reason);
                })
            );
    }

    constructor(private appInstService: ApplicationInstanceManagementService, private logger: LoggerService) {
    }
}
