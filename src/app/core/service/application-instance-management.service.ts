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
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ApplicationInstance } from '../model/application-instance.model';
import { ConfigurationService } from '../../configuration/configuration.service';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { ApplicationInstancesManagementService } from './application-instances-management.service';
import { ServiceTemplateInstance } from '../model/new-api/service-template-instance.model';
import { ApplicationManagementService } from './application-management.service';

@Injectable()
export class ApplicationInstanceManagementService {

    constructor(private logger: OpenToscaLoggerService,
                private appInstancesService: ApplicationInstancesManagementService,
                private applicationManagementService: ApplicationManagementService) {
    }

    getServiceTemplateInstance(appID: string, instanceID: string): Observable<ServiceTemplateInstance> {
        return this.applicationManagementService.getCsarDescriptionByCsarID(appID).flatMap((app) => {
            return this.appInstancesService.getServiceTemplateInstancesOfCsar(app);
        }).map((instances) => {
            for (const instance of instances) {
                if (instance.id === parseInt(instanceID, 10)) {
                    return instance;
                }
            }
        })
    }

    loadApplicationInstance(appID: string, appInstanceID: string): Observable<ApplicationInstance> {
        return this.appInstancesService.loadInstancesList(appID)
            .map(instances => {
                for (const instance of instances) {
                    if (instance.shortServiceTemplateInstanceID === appInstanceID) {
                        return instance;
                    }
                }
                this.logger.handleObservableError('[application-instance.service][loadApplicationInstance]',
                    new Error('Given instance id not found in application instances'));
            })
            .catch(reason => this.logger.handleObservableError('[application-instance.service][loadApplicationInstance]', reason));

    }
}
