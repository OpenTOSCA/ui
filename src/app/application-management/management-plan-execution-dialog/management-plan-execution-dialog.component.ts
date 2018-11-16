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
import { Plan } from '../../core/model/plan.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { globals } from '../../globals';

@Component({
    selector: 'opentosca-management-plan-execution-dialog',
    templateUrl: './management-plan-execution-dialog.component.html'
})
export class ManagementPlanExecutionDialogComponent implements OnInit{


    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() plan: Plan;
    @Input() inputValidation: boolean = true;

    public runnable: boolean;

    constructor(
        private appService: ApplicationManagementService,
        private ngRedux: NgRedux<AppState>,
        private logger: LoggerService) {
    }

    ngOnInit(): void {
        if(this.plan) {
            this.checkInputs();
        }
    }

    get hiddenElements(): Array<String> {
        return globals.hiddenElements;
    }

    /**
     * Closes the modal and emits change event.
     */
    closeModal(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    checkInputs(): void {
        if (false === this.inputValidation) {
            this.logger.log('[management-plan-execution-dialog.component][checkInputs]:', 'Input Validation deactivated');
            this.runnable = true;
            return;
        }
        for (const parameter of this.plan.input_parameters) {
            if((-1 === this.hiddenElements.indexOf(parameter.name)) && ('YES' === parameter.required)) {
                if (parameter.value == null || parameter.value === '') {
                    this.runnable = false;
                    return;
                }
            }
        }
        this.runnable = true;
    }

    runPlan(): void {
        this.visible = false;
        this.appService.triggerManagementPlan(this.plan).subscribe(() => {
            this.logger.log(
                '[management-plan-execution-dialog][run management plan]',
                'Received result after post ' + JSON.stringify(location)
            );
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'info',
                    summary: 'Plan Execution Started',
                    detail: 'The management plan ' + this.plan.id + ' is executing.'
                }
            ));
        }, err => {
            this.logger.handleError('[management-plan-execution-dialog][run management plan]', err);
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Failure at Management Plan Execution',
                    detail: 'The management plan ' + this.plan.id + ' was NOT propperly executed.'
                }
            ));
        });
    }
}
