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
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'opentosca-application-instance-list',
    templateUrl: './application-instance-list.component.html'
})
export class ApplicationInstanceListComponent implements OnInit {

    @Input() terminationPlanAvailable = false;
    @Output() public onTerminateInstance: EventEmitter<string> = new EventEmitter();

    @select(['container', 'application', 'instances']) instances$: Observable<Map<string, ServiceTemplateInstance>>;
    instances: Array<ServiceTemplateInstance>;

    cols;

    constructor(private confirmationService: ConfirmationService) {
        this.instances$.subscribe(i => this.instances = Array.from(i.values()));
    }

    ngOnInit(): void {
        this.cols = [
            { field: 'id', header: 'Instance ID', sortable: true },
            { field: 'state', header: 'State', sortable: true },
            { field: 'created_at', header: 'Creation Date', sortable: true },
            { field: 'actions', header: '', sortable: false }
        ];
    }

    terminate(id: string): void {
        this.confirmationService.confirm({
            message: 'Do you want to terminate this instance?',
            header: 'Confirm Termination',
            accept: () => {
                this.onTerminateInstance.emit(id);
            }
        });
    }
}
