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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, AfterViewInit } from '@angular/core';
import { Plan } from '../../core/model/plan.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { globals } from '../../globals';
import { Observable } from 'rxjs';
import { Interface } from '../../core/model/interface.model';
import { SelectItemGroup } from 'primeng/api';
import { PlanTypes } from '../../core/model/plan-types.model';
import { NodeOperationInterface, NodeOperationAttributes } from 'src/app/core/model/node-operation.model';
import { ApplicationInstanceManagementService } from 'src/app/core/service/application-instance-management.service';
import { ServiceTemplateInstance } from 'src/app/core/model/service-template-instance.model';

@Component({
    selector: 'opentosca-application-instance-management-operation-execution-dialog',
    templateUrl: './application-instance-management-operation-execution-dialog.component.html'
})
export class ApplicationInstanceManagementOperationExecutionDialogComponent implements OnInit, OnChanges {

    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    // interfaces are passed to select management operations
    @Input() interfaces: NodeOperationInterface[];
    // ServiceTemplateInstance are passed to have right url to post to
    @Input() serviceTemplateInstance: ServiceTemplateInstance;
     @Input() inputValidation = true;
    @Output() nodeInstanceStateChange = new EventEmitter();

    interfacesList: SelectItemGroup[];


    public showInputs = false;
    //public selectedPlan: Plan;
    public selectedOperation: NodeOperationAttributes;
    public selectedInterface: NodeOperationInterface;
    public runnable: boolean;
    private readonly interfaceFromOperationDelimiter = '#';

    constructor(
        private appService: ApplicationManagementService,
        private appInstanceService: ApplicationInstanceManagementService,
        private ngRedux: NgRedux<AppState>,
        private logger: LoggerService) {
    }

    ngOnInit(): void {
        // this.interfaces.subscribe(value => this.updateInterfaceList(value));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (this.interfaces) {
                let nodeTemplates = this.observeNodeTemplates();
                this.updateInterfaceList(nodeTemplates);
            }
        }
    }


        /**
     * Add eventlisteners to winery nodes, so we know when they are selected!
     *
     */
    observeNodeTemplates(): string[] {
        let nodeTemplates = document.querySelectorAll('winery-node .nodeTemplate');
        let nodes = [];
        nodeTemplates.forEach(node => {
            if (node.classList.contains('selected')) {
                nodes.push(node.id);
            }
        })
        return nodes;
    }

    /**
     * Closes the modal and emits change event.
     */
    closeModal(): void {
        this.visible = false;
        this.selectedOperation = null;
        this.selectedInterface = null;
        this.runnable = false;
        this.showInputs = false;
        this.visibleChange.emit(false);
    }

    operationSelected(op: string): void {
        if (op) {
            const names = op.split(this.interfaceFromOperationDelimiter);
            this.selectedInterface = this.interfaces.find(iface => iface.name === names[0]);
            const selectedOperation = this.selectedInterface.node_operations.find(operation => operation.name === names[1]);

            this.selectedOperation = selectedOperation;

            this.updateInputValues();

            this.checkInputs();
        }
    }

    updateInputValues(): void {
        for (const parameter of this.selectedOperation.input_parameters) {
            if (parameter.value == null || parameter.value === '') {
                this.interfaces.forEach(iface => {

                    Object.keys(iface.node_instance_properties).forEach( prop => {
                         if (prop === parameter.name) {
                             parameter.value = iface.node_instance_properties[prop];
                         }
                    });
                });
            }

        }
    }

    checkInputs(): void {
        if (false === this.inputValidation) {
            this.logger.log('[application-instance-management-operation-execution-dialog.component][checkInputs]:', 'Input Validation deactivated');
            this.runnable = true;
            return;
        }
        for (const parameter of this.selectedOperation.input_parameters) {
            if ('YES' === parameter.required) {
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
        // this.appService.triggerManagementPlan(this.selectedPlan, this.instanceId).subscribe(() => {
        //     this.logger.log(
        //         '[management-plan-execution-dialog][run management plan]',
        //         'Received result after post ' + JSON.stringify(location)
        //     );
        //     this.ngRedux.dispatch(GrowlActions.addGrowl(
        //         {
        //             severity: 'info',
        //             summary: 'Plan Execution Started',
        //             detail: 'The management plan ' + this.selectedPlan.id + ' is executing.'
        //         }
        //     ));
        // }, err => {
        //     this.logger.handleError('[management-plan-execution-dialog][run management plan]', err);
        //     this.ngRedux.dispatch(GrowlActions.addGrowl(
        //         {
        //             severity: 'error',
        //             summary: 'Failure at Management Plan Execution',
        //             detail: 'The management plan ' + this.selectedPlan.id + ' was NOT propperly executed.'
        //         }
        //     ));
        // });

        // this.visible = false;
        let iface: NodeOperationInterface = this.selectedInterface;

        this.appInstanceService.runNodeTemplateManagementOperations(this.selectedOperation, this.selectedInterface, this.serviceTemplateInstance).subscribe(result => {
            this.nodeInstanceStateChange.emit({
                id: iface.node_instance_id,
                state: result.state
            })
            this.closeModal();
        });
    }

    private updateInterfaceList(nodes: string[]): void {
        if (this.interfaces) {
            this.interfacesList = [];
            this.interfaces.forEach(iface => {
                const copy: SelectItemGroup = { label: iface.name, items: [] };
                if (nodes.length > 0) {
                    nodes.forEach(node => {
                        if (node === iface.node_instance_id) {
                            iface.node_operations.forEach(op => {
                                copy.items.push({
                                    label: op.name, value: iface.name + this.interfaceFromOperationDelimiter + op.name
                                });
                            });
                        }
                    })
                } else {
                    iface.node_operations.forEach(op => {
                        copy.items.push({
                            label: op.name, value: iface.name + this.interfaceFromOperationDelimiter + op.name
                        });
                    });
                }


                if (copy.items.length > 0) {
                    this.interfacesList.push(copy);
                }
            });
        }
    }
}
