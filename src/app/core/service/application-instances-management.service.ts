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
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { ApplicationManagementService } from './application-management.service';
import { Observable } from 'rxjs/Observable';
import { ApplicationInstance } from '../model/application-instance.model';

@Injectable()
export class ApplicationInstancesManagementService {

    constructor(private logger: OpenToscaLoggerService,
                private appService: ApplicationManagementService) {
    }

    /**
     * Loads instances of the current app and push it to redux store
     */
    loadInstancesList(appID: string): Observable<Array<ApplicationInstance>> {
        return this.appService.getServiceTemplateInstancesByAppID(appID)
            .flatMap(instancesReferences => {
                return this.appService.getPropertiesOfServiceTemplateInstances(instancesReferences)
                    .map(instancesPropertiesList => {
                        const preparedResults: Array<ApplicationInstance> = [];
                        for (const instanceProperties of instancesPropertiesList) {
                            const appInstance = new ApplicationInstance(appID, instanceProperties.instanceReference, instanceProperties);
                            preparedResults.push(appInstance);
                        }
                        return preparedResults;
                    })
                    .catch(reason => this.logger.handleError(
                        '[application-instances.service][loadInstancesList][getProvisioningStateofServiceTemplateInstance]',
                        reason));
            })
            .catch(reason => this.logger.handleError(
                '[application-instances.service][loadInstancesList][getServiceTemplateInstancesByAppID]', reason
            ));
    }

}
