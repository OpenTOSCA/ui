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

import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { Injectable } from '@angular/core';
import { DeploymentTest } from '../model/deployment-test';
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class DeploymentTestService {

    constructor(private http: HttpClient, private logger: OpenToscaLoggerService) {
    }

    getDeploymentTests(serviceTemplateInstance: ServiceTemplateInstance): Observable<Array<DeploymentTest>> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(serviceTemplateInstance._links['deploymenttests'].href, httpOptions)
            .pipe(
                map((data: any) => data.items),
                catchError(error => this.logger.handleObservableError('[deployment-test.service][getDeploymentTests]', error))
            )
    }

    runDeploymentTest(serviceTemplateInstance: ServiceTemplateInstance): Observable<Object> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.post(serviceTemplateInstance._links['deploymenttests'].href, httpOptions);
    }
}
