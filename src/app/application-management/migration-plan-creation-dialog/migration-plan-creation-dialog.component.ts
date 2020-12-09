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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Plan } from '../../core/model/plan.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { globals } from '../../globals';
import { Observable } from 'rxjs';
import { Interface } from '../../core/model/interface.model';
import {SelectItem, SelectItemGroup} from 'primeng/api';
import { PlanTypes } from '../../core/model/plan-types.model';
import { PlacementService } from '../../core/service/placement.service';
import { PlacementModel } from '../../core/model/placement.model';
import { Path } from '../../core/path';
import { PlacementNodeTemplate } from '../../core/model/placement-node-template.model';
import { NodeTemplateInstance } from '../../core/model/node-template-instance.model';
import { PlacementPair } from '../../core/model/placement-pair.model';
import { PlanParameter } from '../../core/model/plan-parameter.model';
import {Csar} from "../../core/model/csar.model";

@Component({
    selector: 'opentosca-migration-plan-creation-dialog',
    templateUrl: './migration-plan-creation-dialog.component.html'
})
export class MigrationPlanCreationDialogComponent implements OnInit, OnChanges {

    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() csar: Observable<Csar>;

    @select(['container', 'applications']) public readonly apps: Observable<Array<Csar>>;

    public loading = false;
    public selectedApp: Csar;
    public runnable: boolean;
    public csars: Csar[];
    public selection : SelectItem[];
    public creationInProgress: boolean;


    constructor(
        private appService: ApplicationManagementService,
        private ngRedux: NgRedux<AppState>,
        private logger: LoggerService) {
    }

    operationSelected(app: Csar): void {
        if (app) {
            console.log("Selected following app:");
            console.log(app);
            this.selectedApp = app;
        }
    }


    ngOnInit(): void {
        this.appService.getResolvedApplications().subscribe(value => {console.log("Found following csars:"); console.log(value); this.updateSelectionList(value)});
        this.creationInProgress = false;
    }

    private updateSelectionList(csars: Csar[]): void {
        this.selection = [];
        this.csar.subscribe(value => {
            csars.forEach(csar => {
                if (value.id != csar.id){
                    this.selection.push({ label: csar.name, value: csar });
                }
            });
        });


    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    /**
     * Closes the modal and emits change event.
     */
    closeInputModal(): void {
        this.visible = false;
        this.creationInProgress = false;
        // TODO: remove this or place elsewhere
        this.selectedApp = null;
        this.visibleChange.emit(false);
    }

    createMigrationPlan(): void {
        this.creationInProgress = true;
        this.csar.subscribe(value => {
            this.appService.createMigrationPlan(value.id, this.selectedApp.id).subscribe( value => {
                console.log("Following result was received:");
                console.log(value);
                this.creationInProgress = false;
                this.visible = false;
                // TODO: remove this or place elsewhere
                this.selectedApp = null;
                this.visibleChange.emit(false);

            });
        });




    }
}
