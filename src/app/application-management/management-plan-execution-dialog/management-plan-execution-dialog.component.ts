/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plan } from '../../core/model/new-api/plan.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';

@Component({
    selector: 'opentosca-management-plan-execution-dialog',
    templateUrl: './management-plan-execution-dialog.component.html'
})
export class ManagementPlanExecutionDialogComponent {

    _visible: boolean = true;

    @Input()
    get visible(): boolean {
        return this._visible;
    }

    @Output()
    visibleChange = new EventEmitter<boolean>();

    set visible(val: boolean) {
        this._visible = val;
        this.visibleChange.emit(val);
    }


    @Input()
    plan: Plan = null;

    runnable: boolean = false;

    get hiddenElements(): Array<String> {
        return [
            'CorrelationID',
            'csarID',
            'serviceTemplateID',
            'containerApiAddress',
            'instanceDataAPIUrl',
            'planCallbackAddress_invoker',
            'csarEntrypoint'
        ]
    }

    constructor(private ngRedux: NgRedux<AppState>) {
    }

    checkInputs(): void {
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
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'warning',
                summary: 'Plan NOT started',
                detail: 'The plan ' + this.plan.id + ' was not run. Blame the Dev!'
            }
        ));
    }
}
