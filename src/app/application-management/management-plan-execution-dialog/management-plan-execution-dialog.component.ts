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
import { SelectItemGroup } from 'primeng/api';
import { PlanTypes } from '../../core/model/plan-types.model';
import { PlacementService } from '../../core/service/placement.service';
import { PlacementModel } from '../../core/model/placement.model';
import { Path } from '../../core/path';
import { PlacementNodeTemplate } from '../../core/model/placement-node-template.model';
import { NodeTemplateInstance } from '../../core/model/node-template-instance.model';
import { PlacementPair } from '../../core/model/placement-pair.model';

@Component({
    selector: 'opentosca-management-plan-execution-dialog',
    templateUrl: './management-plan-execution-dialog.component.html'
})
export class ManagementPlanExecutionDialogComponent implements OnInit, OnChanges {

    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() plan_type: PlanTypes;
    @Input() plan: Plan;
    @Input() inputValidation = true;
    @Input() instanceId: string;

    @select(['container', 'application', 'interfaces']) interfaces: Observable<Interface[]>;
    private allInterfaces: Interface[];
    interfacesList: SelectItemGroup[];

    // placement model with node templates that need to be placed
    inputPlacementModel: PlacementModel;
    // return of container with valid instance list for each node template that need to nbe placed
    outputPlacementModel: PlacementNodeTemplate[];
    checkForAbstractOSOngoing = false;

    // list of placement pair, i.e. node template to be placed and selected instance (in dropdown)
    placementPairs: PlacementPair[];

    // abstract operating system node type
    private operatingSystemNodeType = "{http://opentosca.org/nodetypes}OperatingSystem";
    // name of property where we set selected instance
    operatingSystemProperty = "instanceRef";
    operatingSystemPropertyDelimiter = "_";
    selectedInstanceDisplayLimiter = ",";

    public instanceSelected = false;
    public abstractOSNodeTypeFound = false;

    public loading = false;
    public showInputs = false;
    public selectedPlan: Plan;
    public runnable: boolean;
    private readonly interfaceFromOperationDelimiter = '#';

    constructor(
        private appService: ApplicationManagementService,
        private placementService: PlacementService,
        private ngRedux: NgRedux<AppState>,
        private logger: LoggerService) {
    }

    get hiddenElements(): Array<String> {
        return globals.hiddenElements;
    }

    isInitPlan(): boolean {
        if (this.plan_type == PlanTypes.BuildPlan) {
            return true;
        } else {
            return false;
        }
    }

    ngOnInit(): void {
        this.interfaces.subscribe(value => this.updateInterfaceList(value));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (changes['plan_type']) {
                this.updateInterfaceList();
            }
            if (changes['visible']) {
                this.showInputs = false;
            }
            if (this.plan) {
                this.showInputs = true;
                this.selectedPlan = this.plan
            }
        }
    }

    /**
     * Closes the modal and emits change event.
     */
    closeInputModal(): void {
        this.visible = false;
        this.selectedPlan = null;
        this.visibleChange.emit(false);
    }

    closeCheckModal(): void {
        this.closeInputModal();
        this.checkForAbstractOSOngoing = false;
    }

    operationSelected(op: string): void {
        if (op) {
            const names = op.split(this.interfaceFromOperationDelimiter);
            const selectedInterface = this.allInterfaces.find(iface => iface.name === names[0]);
            const selectedOperation = selectedInterface.operations.find(operation => operation.name === names[1]);

            this.selectedPlan = selectedOperation._embedded.plan;
        }
    }

    checkInputs(): void {
        if (false === this.inputValidation) {
            this.logger.log('[management-plan-execution-dialog.component][checkInputs]:', 'Input Validation deactivated');
            this.runnable = true;
            return;
        }
        for (const parameter of this.selectedPlan.input_parameters) {
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
        this.appService.triggerManagementPlan(this.selectedPlan, this.instanceId).subscribe(() => {
            this.logger.log(
                '[management-plan-execution-dialog][run management plan]',
                'Received result after post ' + JSON.stringify(location)
            );
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'info',
                    summary: 'Plan Execution Started',
                    detail: 'The management plan ' + this.selectedPlan.id + ' is executing.'
                }
            ));
        }, err => {
            this.logger.handleError('[management-plan-execution-dialog][run management plan]', err);
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Failure at Management Plan Execution',
                    detail: 'The management plan ' + this.selectedPlan.id + ' was NOT propperly executed.'
                }
            ));
        });
    }

    continue(): void {
        this.checkForAbstractOSOngoing = false;
        this.showInputs = true;
        this.checkInputs();
    }

    confirm(): void {
        this.continue();
        for (const inputParam of this.selectedPlan.input_parameters) {
            const name = inputParam.name;
            // check if instance ref property is available in input params list
            if (name.includes(this.operatingSystemProperty)) {
                // iterate over every placement pair, i.e. each node template that needs to be placed and the selected instance
                for (const placementPair of this.placementPairs) {
                    const placementNodeTemplateId = placementPair.nodeTemplate.id;
                    /* get number x from get_input: instanceRef_x to match with node template id to assign the selected instances correctly to the according node template ids
                    this is required since input params are in this representation not related to their originating node templates */
                    const nrInputParam = name.substring(name.lastIndexOf(this.operatingSystemPropertyDelimiter) + 1);
                    // get number x from nodeTemplateId_x to match with instanceRef_x to assign values correctly (see comment above)
                    const nrPlacementNodeTemplate = placementNodeTemplateId.substring(placementNodeTemplateId.lastIndexOf(this.operatingSystemPropertyDelimiter) + 1);
                    // check if instanceRef_x matches nodeTemplateId_y, if x = y instanceRef_x is selected instance for node template nodeTemplateId_y
                    if (nrInputParam == nrPlacementNodeTemplate || (!this.isNumeric(inputParam.name) && !this.isNumeric(nrPlacementNodeTemplate))) {
                        inputParam.value = placementPair.selectedInstance.service_template_instance_id + this.selectedInstanceDisplayLimiter
                            + placementPair.selectedInstance.node_template_id + this.selectedInstanceDisplayLimiter
                            + placementPair.selectedInstance.id;
                    }
                }
            }
        }
    }

    isNumeric(input: string): boolean {
        return !isNaN(parseInt(input));
    }

    confirmPlan(): void {
        if (!this.isInitPlan()) {
            this.visible = false;
        }
        this.loading = true;
        this.checkForAbstractOSOngoing = true;
        // get (first) service template of CSAR
        this.appService.getFirstServiceTemplateOfCsar(this.ngRedux.getState().container.application.csar.id).subscribe(
            data => {
                // get node templates of service template
                this.appService.getNodeTemplatesOfServiceTemplate(data).subscribe(
                    data => {
                        this.inputPlacementModel = new PlacementModel();
                        this.inputPlacementModel.needToBePlaced = [];
                        // iterate over node templates of service template
                        for (let nodeTemplate of data.node_templates) {
                            // check if abstract OS node type contained
                            if (nodeTemplate.node_type === this.operatingSystemNodeType) {
                                // if contained, add to need to be placed list
                                this.inputPlacementModel.needToBePlaced.push(nodeTemplate);
                                this.abstractOSNodeTypeFound = true;
                            }
                        }
                        this.loading = false;
                        // get all running instances that "match" node templates that need to be placed
                        this.outputPlacementModel = [];
                        if (this.inputPlacementModel.needToBePlaced.length) {
                            // start placement if need to be placed not empty
                            this.appService.getFirstServiceTemplateOfCsar(this.ngRedux.getState().container.application.csar.id).subscribe(
                                data => {
                                    const postURL = new Path(data)
                                        .append('placement')
                                        .toString();
                                    // request all available, valid instances from container for node templates that need to be placed
                                    this.placementService.getAvailableInstances(postURL, this.inputPlacementModel).subscribe(
                                        data => {
                                            this.outputPlacementModel = data;
                                        }
                                    );
                                }
                            );
                        }
                    }
                )
            }
        )
    }

    onInstanceSelected(nodeTemplate: PlacementNodeTemplate, selectedInstance: NodeTemplateInstance) {
        if (!this.placementPairs) {
            this.placementPairs = [];
        }
        this.instanceSelected = true;

        const placementPair: PlacementPair = new PlacementPair();
        placementPair.nodeTemplate = nodeTemplate;
        placementPair.selectedInstance = selectedInstance;
        // check if node template already exists in list of placement pairs
        const checkPlacementPairExistence = placementParam => this.placementPairs.some(({ nodeTemplate }) => nodeTemplate == placementParam);

        if (!checkPlacementPairExistence(placementPair.nodeTemplate)) {
            this.placementPairs.push(placementPair);
        } else {
            // if node template already exists in list, just update the selected instance
            const index = this.placementPairs.findIndex(x => x.nodeTemplate == placementPair.nodeTemplate);
            this.placementPairs[index].selectedInstance = placementPair.selectedInstance;
        }
    }

    private updateInterfaceList(value?: Interface[]): void {
        if (value) {
            this.allInterfaces = value;
        }
        if (this.plan_type && this.allInterfaces) {
            this.interfacesList = [];
            this.allInterfaces.forEach(iface => {
                const copy: SelectItemGroup = { label: iface.name, items: [] };
                iface.operations.forEach(op => {
                    if (op._embedded.plan.plan_type === this.plan_type) {
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
