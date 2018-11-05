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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Plan } from '../../core/model/plan.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';

@Component({
    selector: 'opentosca-management-plan-execution-dialog',
    templateUrl: './management-plan-execution-dialog.component.html'
})
export class ManagementPlanExecutionDialogComponent {

    private _visible: boolean = true;
    private _plan: Plan;

    @Input()
    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
        this.visibleChange.emit(value);
    }

    @Output()
    visibleChange = new EventEmitter<boolean>();


    @Input()
    get plan(): Plan {
        return this._plan;
    }

    set plan(value: Plan) {
        this._plan = value;

        if (value) {
            this.checkInputs();
        }
    }

    @Input()
    inputValidation: boolean = true;

    runnable: boolean;

    get hiddenElements(): Array<String> {
        return [
            'CorrelationID',
            'csarID',
            'serviceTemplateID',
            'containerApiAddress',
            'instanceDataAPIUrl',
            'planCallbackAddress_invoker',
            'csarEntrypoint',
            'OpenTOSCAContainerAPIServiceInstanceID'
        ];
    }

    constructor(
        private appService: ApplicationManagementService,
        private ngRedux: NgRedux<AppState>,
        private logger: OpenToscaLoggerService) {
    }

    checkInputs(): void {
        if (!this.inputValidation) {
            this.runnable = true;
            return;
        }

        for (const parameter of this.plan.input_parameters) {
            if (parameter.required !== 'YES' || this.hiddenElements.indexOf(parameter.name) !== -1) {
                continue;
            }

            if (parameter.value == null || parameter.value === '') {
                this.runnable = false;
                return;
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
                    severity: 'warning',
                    summary: 'Management Plan executed',
                    detail: 'The management plan ' + this.plan.id + ' was executed.'
                }
            ));
        }, err => {
            this.logger.handleError('[management-plan-execution-dialog][run management plan]', err);
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Failure to execute the Management Plan',
                    detail: 'The management plan ' + this.plan.id + ' was NOT propperly executed.'
                }
            ));
        });
    }
}
