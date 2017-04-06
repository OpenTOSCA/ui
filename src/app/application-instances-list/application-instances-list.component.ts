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
 *     Karoline Saatkamp - initial implementation
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TriggerTerminationPlanEvent } from '../shared/model/trigger-termination-plan-event.model';
import { ApplicationInstance } from '../shared/model/application-instance.model';

@Component({
    selector: 'opentosca-application-instances-list',
    templateUrl: 'application-instances-list.component.html',
    animations: [
        trigger('fadeInOut', [
            state('in', style({'opacity': 1})),
            transition('void => *', [
                style({'opacity': 0}),
                animate('500ms ease-out')
            ]),
            transition('* => void', [
                style({'opacity': 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
})

export class ApplicationInstancesListComponent {

    @Input() public instances: Array<ApplicationInstance>;
    @Output() public onTerminateInstance: EventEmitter<TriggerTerminationPlanEvent> = new EventEmitter();

    constructor() {
    }

    terminateInstance(instanceID: string): void {
        this.onTerminateInstance.emit(new TriggerTerminationPlanEvent(instanceID));
    }

}
