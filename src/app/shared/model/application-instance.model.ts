/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Karoline Saatkamp - initial implementation
 *     Michael Falkenthal - initial implementation
 */

import { ResourceReference } from './resource-reference.model';
import { Application } from './application.model';
import { ApplicationInstanceProperties } from './application-instance-properties.model';

// Todo Consolidate application model with OpenTOSCA ServiceTemplateInstance model
export class ApplicationInstance {
    serviceTemplateInstanceID: string;
    shortServiceTemplateInstanceID: string;
    app: Application;
    instanceReference: ResourceReference;
    properties: ApplicationInstanceProperties;
    selfserviceApplicationUrl?: string;

    constructor(app: Application, reference: ResourceReference, properties: ApplicationInstanceProperties) {
        this.app = app;
        this.instanceReference = reference;
        this.properties = properties;
        if(properties.selfServiceApplicationURL) {
            this.selfserviceApplicationUrl = properties.selfServiceApplicationURL;
        }
        this.serviceTemplateInstanceID = reference.href;
        this.shortServiceTemplateInstanceID = reference.href.split('/').pop();
    }
}
