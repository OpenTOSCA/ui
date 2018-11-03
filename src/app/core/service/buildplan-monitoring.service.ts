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
import { PlanInstance } from '../model/plan-instance.model';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class BuildplanMonitoringService {

    constructor(
            private http: HttpClient,
            private logger: OpenToscaLoggerService) {
    }

    getBuildPlan(url: string): Observable<PlanInstance> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<PlanInstance>(url, httpOptions)
            .pipe(
                catchError(err => this.logger.handleObservableError('[buildplan-monitor.service][getBuildPlan]', err))
            )
    }

}
