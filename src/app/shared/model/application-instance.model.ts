/**
 * Copyright (c) 2017 University of Stuttgart.
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
    public serviceTemplateInstanceID: string;
    public shortServiceTemplateInstanceID: string;
    public appID: string;
    public instanceReference: ResourceReference;
    public properties: ApplicationInstanceProperties;
    public selfserviceApplicationUrl?: string;

    constructor(appID: string, reference: ResourceReference, properties: ApplicationInstanceProperties) {
        this.appID = appID;
        this.instanceReference = reference;
        this.properties = properties;
        if (properties.selfServiceApplicationURL) {
            this.selfserviceApplicationUrl = properties.selfServiceApplicationURL;
        }
        this.serviceTemplateInstanceID = reference.href;
        this.shortServiceTemplateInstanceID = reference.href.split('/').pop();
    }
}
