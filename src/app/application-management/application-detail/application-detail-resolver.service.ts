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
import { ActivatedRouteSnapshot } from '@angular/router';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { Csar } from '../../core/model/csar.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApplicationDetailResolverService {

    resolve(route: ActivatedRouteSnapshot): Observable<Csar> {
        return this.appService.getDescriptionByCsarId(route.params['id'])
            .pipe(
                catchError(reason => {
                    return this.logger.handleError('[application-details-resolver.service][resolve]', reason);
                })
            );
    }

    constructor(private appService: ApplicationManagementService, private logger: LoggerService) {
    }
}
