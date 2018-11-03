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
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { ApplicationInstancesManagementService } from './application-instances-management.service';
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { ApplicationManagementService } from './application-management.service';
import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

@Injectable()
export class ApplicationInstanceManagementService {

    constructor(private logger: OpenToscaLoggerService,
                private appInstancesService: ApplicationInstancesManagementService,
                private applicationManagementService: ApplicationManagementService) {
    }

    getServiceTemplateInstance(appID: string, instanceID: string): Observable<ServiceTemplateInstance> {
        return this.applicationManagementService.getCsarDescriptionByCsarID(appID)
            .pipe(
                flatMap((app) => {
                    return this.appInstancesService.getServiceTemplateInstancesOfCsar(app);
                }),
                map((instances) => {
                    for (const instance of instances) {
                        if (instance.id === +instanceID) {
                            return instance;
                        }
                    }
                })
            )
    }
}
