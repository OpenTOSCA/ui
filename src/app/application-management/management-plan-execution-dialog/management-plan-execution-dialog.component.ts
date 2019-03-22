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
import { ApplicationManagementActions } from '../application-management-actions';
import { Observable } from 'rxjs';
import { Interface } from '../../core/model/interface.model';
import { SelectItemGroup } from 'primeng/api';
import { PlanTypes } from '../../core/model/plan-types.model';

@Component({
    selector: 'opentosca-management-plan-execution-dialog',
    templateUrl: './management-plan-execution-dialog.component.html'
})
export class ManagementPlanExecutionDialogComponent implements OnInit, OnChanges {

    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() plan: Plan;
    @Input() inputValidation = true;

    @select(['container', 'application', 'interfaces']) interfaces: Observable<Interface[]>;
    private allInterfaces: Interface[];
    interfacesList: SelectItemGroup[];

    public showInputs = false;
    public selectedPlan: Plan;
    public runnable: boolean;
    private readonly interfaceFromOperationDelimiter = '#';

    constructor(
        private appService: ApplicationManagementService,
        private ngRedux: NgRedux<AppState>,
        private logger: LoggerService) {
    }

    get hiddenElements(): Array<String> {
        return globals.hiddenElements;
    }

    ngOnInit(): void {
        this.interfaces.subscribe(value => this.updateInterfaceList(value));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes['plan']) {
            this.updateInterfaceList();
        }
        if (changes && changes['visible']) {
            this.showInputs = false;
        }
    }

    /**
     * Closes the modal and emits change event.
     */
    closeModal(): void {
        this.visible = false;
        this.selectedPlan = null;
        this.visibleChange.emit(false);
    }

    operationSelected(op: string): void {
        const names = op.split(this.interfaceFromOperationDelimiter);
        const selectedInterface = this.allInterfaces.find(iface => iface.name === names[0]);
        const selectedOperation = selectedInterface.operations.find(operation => operation.name === names[1]);

        this.selectedPlan = selectedOperation._embedded.plan;

        if (this.selectedPlan.plan_type === PlanTypes.BuildPlan) {
            this.ngRedux.dispatch(ApplicationManagementActions.updateBuildPlan(this.selectedPlan));
        } else if (this.selectedPlan.plan_type === PlanTypes.TerminationPlan) {
            this.ngRedux.dispatch(ApplicationManagementActions.updateTerminationPlan(this.selectedPlan))
        }
        this.checkInputs();
    }

    checkInputs(): void {
        if (false === this.inputValidation) {
            this.logger.log('[management-plan-execution-dialog.component][checkInputs]:', 'Input Validation deactivated');
            this.runnable = true;
            return;
        }
        for (const parameter of this.plan.input_parameters) {
            if ((-1 === this.hiddenElements.indexOf(parameter.name)) && ('YES' === parameter.required)) {
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

    private updateInterfaceList(value?: Interface[]): void {
        if (value) {
            this.allInterfaces = value;
        }
        if (this.plan && this.allInterfaces) {
            this.interfacesList = [];
            this.allInterfaces.forEach(iface => {
                const copy: SelectItemGroup = { label: iface.name, items: [] };
                iface.operations.forEach(op => {
                    if (op._embedded.plan.plan_type === this.plan.plan_type) {
                        copy.items.push({
                            label: op.name, value: iface.name + this.interfaceFromOperationDelimiter + op.name
                        });
                    }
                });

                if (copy.items.length > 0) {
                    this.interfacesList.push(copy);
                }
            });
        }
    }
}
