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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';

@Component({
    selector: 'opentosca-application-instance-list',
    templateUrl: './application-instance-list.component.html',
    styleUrls: ['./application-instance-list.component.scss']
})
export class ApplicationInstanceListComponent  {

    @Input() terminationPlanAvailable: boolean = false;
    @Output() public onTerminateInstance: EventEmitter<string> = new EventEmitter();

    @select(['container', 'application', 'instances']) currentAppInstances: Observable<Array<ServiceTemplateInstance>>;

    constructor() {
    }

    terminateInstance(instanceID: string): void {
        this.onTerminateInstance.emit(instanceID);
    }

}
