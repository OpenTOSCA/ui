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
import { ConfigurationService } from '../../configuration/configuration.service';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { ApplicationInstancesManagementService } from './application-instances-management.service';

@Injectable()
export class ApplicationInstanceManagementService {

    constructor(private logger: OpenToscaLoggerService,
                private appInstancesService: ApplicationInstancesManagementService) {
    }

    // DON'T remove me this is used by https://github.com/OpenTOSCA/ui/pull/15
}
