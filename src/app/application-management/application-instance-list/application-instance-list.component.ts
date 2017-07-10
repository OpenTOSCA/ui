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
import { Component, EventEmitter, Output } from '@angular/core';
import { TriggerTerminationPlanEvent } from '../../core/model/trigger-termination-plan-event.model';
import { ServiceTemplateInstanceListEntry } from '../../core/model/new-api/service-template-instance-list-entry.model';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';

@Component({
    selector: 'opentosca-ui-application-instance-list',
    templateUrl: './application-instance-list.component.html',
    styleUrls: ['./application-instance-list.component.scss']
})
export class ApplicationInstanceListComponent {

    @select(['container', 'currentAppInstances']) currentAppInstances: Observable<Array<ServiceTemplateInstanceListEntry>>;
    @Output() public onTerminateInstance: EventEmitter<TriggerTerminationPlanEvent> = new EventEmitter();

    constructor() {
    }

    terminateInstance(instanceID: string): void {
        this.onTerminateInstance.emit(new TriggerTerminationPlanEvent(instanceID));
    }

}
