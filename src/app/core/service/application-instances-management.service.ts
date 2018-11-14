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
import { LoggerService } from './logger.service';
import { Csar } from '../model/csar.model';
import { ServiceTemplateList } from '../model/service-template-list.model';
import { ServiceTemplate } from '../model/service-template.model';
import { ServiceTemplateInstanceList } from '../model/service-template-instance-list.model';
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

@Injectable()
export class ApplicationInstancesManagementService {

    constructor(private logger: LoggerService,
                private http: HttpClient) {
    }

    getServiceTemplateInstancesOfCsar(app: Csar): Observable<Array<ServiceTemplateInstance>> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get<ServiceTemplateList>(app._links['servicetemplates'].href)
            .pipe(
                mergeMap(response => {
                    return this.http.get<ServiceTemplate>(response.service_templates[0]._links['self'].href, httpOptions)
                        .pipe(
                            mergeMap(serviceTemplate => {
                                return this.http.get<ServiceTemplateInstanceList>(serviceTemplate._links['instances'].href, httpOptions)
                                    .pipe(
                                        mergeMap(instanceList => {
                                            const obs: Array<Observable<ServiceTemplateInstance>> = [];
                                            for (const entry of instanceList.service_template_instances) {
                                                obs.push(this.http.get<ServiceTemplateInstance>(entry._links['self'].href, httpOptions));
                                            }
                                            return forkJoin(obs);
                                        }),
                                        catchError(reason => this.logger.handleError(
                                            '[application-instances.service][getServiceTemplateInstances][fetching instances]',
                                            reason))
                                    );
                            }),
                            catchError(reason => this.logger.handleError(
                                '[application-instances.service][getServiceTemplateInstances][fetching service template]',
                                reason))
                        );
                }),
                catchError(reason => this.logger.handleError(
                    '[application-instances.service][getServiceTemplateInstances][fetching service template list]',
                    reason))
            );
    }
}
