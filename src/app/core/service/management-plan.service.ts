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
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { PlanList } from '../model/plan-list.model';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ManagementPlanService {
    httpOptions = {
        headers: new HttpHeaders({
            'Accept': 'application/json'
        })
    };

    constructor(private http: HttpClient, private logger: OpenToscaLoggerService) {
    }

    getManagementPlans(instance: ServiceTemplateInstance): Observable<PlanList> {
        return this.http.get<PlanList>(instance._links['managementplans'].href, this.httpOptions)
            .pipe(
                catchError(err => {
                    this.logger.handleObservableError('[management-plan.service][getManagementPlans]', err);
                    return throwError(err);
                })
            )
    }
}
