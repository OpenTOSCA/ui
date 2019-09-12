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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';
import { Observable } from 'rxjs';
import { DeploymentTestService } from '../../core/service/deployment-test.service';
import { DeploymentTest } from '../../core/model/deployment-test';
import { ApplicationInstanceManagementService } from '../../core/service/application-instance-management.service';
import { PlanInstance } from '../../core/model/plan-instance.model';
import { Csar } from '../../core/model/csar.model';
import { LoggerService } from '../../core/service/logger.service';
import { ServiceTemplateInstanceState } from '../../core/model/service-template-instance-state.model';
import { ServiceTemplateInstanceTopology, NodeTemplateInstance } from '../../core/model/service-template-instance-topology-model';
import { NodeOperationInterface } from '../../core/model/node-operation.model';

@Component({
    selector: 'opentosca-application-instance-detail',
    templateUrl: './application-instance-detail.component.html',
    styleUrls: ['./application-instance-detail.component.scss']
})
export class ApplicationInstanceDetailComponent implements OnInit, OnDestroy {
    public topologyModelerData : any;
    serviceTemplateInstanceTopology: ServiceTemplateInstanceTopology;

    deploymentTests: Observable<Array<DeploymentTest>>;
    serviceTemplateInstance: ServiceTemplateInstance;
    planInstances: Array<PlanInstance>;
    timeout: any;
    dialogVisible: boolean = false;
    interfaces: NodeOperationInterface[] = [];


    constructor(private route: ActivatedRoute,
                private ngRedux: NgRedux<AppState>,
                private deploymentTestService: DeploymentTestService,
                private instanceService: ApplicationInstanceManagementService,
                private logger: LoggerService) {


    }

    /**
     * Updates the service template instance
     */
    reloadAppInstance(): void {
        this.instanceService.getServiceTemplateInstance(this.route.snapshot.paramMap.get('id'),
            this.route.snapshot.paramMap.get('instanceId'))
            .subscribe(result => this.serviceTemplateInstance = result);
    }

    loadInstanceTopology(serviceTemplateInstance: ServiceTemplateInstance): void {
        this.instanceService.getServiceTemplateInstanceTopology(serviceTemplateInstance)
        .subscribe(result => {
            this.serviceTemplateInstanceTopology = result;
            let nodeTemplates: any[] = [];
            let relationshipTemplates: any[] = [];
            let visuals: any[] = [];

            // process node data
            this.serviceTemplateInstanceTopology.node_template_instances_list.service_template_instance_topologies.forEach(topology => {

                let visual = {
                    color: 'green',
                    typeId: topology.id.toString(),
                }

                visuals.push(visual);

                // extend properties with instance state
                topology.properties.NodeInstanceState = topology.state;

                nodeTemplates.push(
                    {
                        properties: {
                            kvproperties: topology.properties
                        },
                        id: topology.id.toString(),
                        type: topology.node_template_type,
                        name: topology.node_template_id,
                        minInstances: 1,
                        maxInstances: 1,
                        visuals: visual

                    },
                );
                // store interface data so it can later be used by application-instance-management-operation-exectution-dialog
                topology.interfaces.interfaces.forEach(element => {
                    let newInterface= new NodeOperationInterface();
                    newInterface.name = element.name;
                    newInterface.node_instance_id = topology.id.toString();
                    newInterface.csarID = topology.csar_id.toString();
                    newInterface.serviceTemplateID = topology.service_template_id.toString();
                    newInterface.serviceInstanceID = topology.service_template_instance_id.toString();
                    newInterface.nodeTemplateID = topology.node_template_id.toString();
                    newInterface.node_instance_properties = topology.properties;
                    Object.keys(element.operations).forEach( op => {
                        newInterface.node_operations.push(element.operations[op]._embedded.node_operation);
                    });
                    this.interfaces.push(newInterface);
                });
            });

            // process relationship data
            this.serviceTemplateInstanceTopology.relationship_template_instances_list.relationship_template_instances.forEach(relationship => {
                relationshipTemplates.push(
                    {
                        sourceElement: {
                            ref: relationship.source_node_template_instance_id.toString()
                        },
                        targetElement: {
                            ref: relationship.target_node_template_instance_id.toString()
                        },
                        //id: relationship.id.toString(),
                        id: relationship.relationship_template_id,
                        type: relationship.relationship_template_type,
                        name: relationship.relationship_template_type.slice(relationship.relationship_template_type.lastIndexOf("}") + 1 )
                    },
                );
            });


            this.topologyModelerData = {
                configuration: {
                    isReadonly: true,
                    endpointConfig: {
                        id: '',
                        ns: '',
                        repositoryURL: '',
                        uiURL: '',
                        compareTo: ''
                    }
                },
                topologyTemplate: {
                    nodeTemplates: nodeTemplates,
                    relationshipTemplates: relationshipTemplates
                },
                visuals: visuals,
                readonlyPropertyDefinitionType: "KV"
            };

        });
    }

    updateInstanceProperties(node: any) {
        this.topologyModelerData.topologyTemplate.nodeTemplates.forEach(element => {
            if (element.id == node.id) {
                element.properties.kvproperties.NodeInstanceState = node.state;
            }
        });

    }

    // runDeploymentTests(): void {
    //     this.deploymentTestService.runDeploymentTest(this.serviceTemplateInstance).subscribe(response => {
    //         this.ngRedux.dispatch(GrowlActions.addGrowl(
    //             {
    //                 severity: 'info',
    //                 summary: 'Running deployment tests...',
    //                 detail: 'Automated application deployment tests have been triggered and are run in background.'
    //             }
    //         ));
    //     });
    // }

    // refresh(): void {
    //     this.deploymentTests = this.deploymentTestService.getDeploymentTests(this.serviceTemplateInstance);
    // }

    /**
     * Triggers update of plan instances
     */
    triggerUpdatePlanInstances(): void {
        this.updatePlanInstances(this.ngRedux.getState().container.application.csar, this.serviceTemplateInstance);
    }

    /**
     * Triggers update of plan instances and service template instance
     */
    triggerUpdate(): void {
        this.triggerUpdatePlanInstances();
        this.reloadAppInstance();
    }

    /**
     * Get new instance information about a plan instance
     * @param csar Csar
     * @param serviceTemplateInstance ServiceTemplateInstance
     */
    updatePlanInstances(csar: Csar, serviceTemplateInstance: ServiceTemplateInstance): void {
        this.instanceService.getPlanInstancesOfServiceTemplateInstance(csar, serviceTemplateInstance)
            .subscribe(
                result => {
                    this.planInstances = result;
                },
                error1 => this.logger.error('[application-instance-detail.component][updatePlanInstances]', error1)
            );
    }

    /**
     * Trigger polling for instances updates if state is neither CREATED nor DELETED
     */
    triggerPollingForInstanceUpdates(): void {
        if (this.serviceTemplateInstance.state !== ServiceTemplateInstanceState.CREATED
            && this.serviceTemplateInstance.state !== ServiceTemplateInstanceState.DELETED) {
                this.timeout = setTimeout(() => this.reloadAppInstance(), 2000);
        } else {
            clearTimeout(this.timeout);
        }
    }


    /**
     * Trigger dialog for management operations on nodes
     */
    showManagementOperationDialog(): void {
        this.dialogVisible = true;
    }

    /**
     * Initialize component
     */
    ngOnInit(): void {
        this.route.data
            .subscribe((data: { serviceTemplateInstance: ServiceTemplateInstance }) => {
                    this.serviceTemplateInstance = data.serviceTemplateInstance;
                    this.loadInstanceTopology(this.serviceTemplateInstance);
                    this.updatePlanInstances(this.ngRedux.getState().container.application.csar, this.serviceTemplateInstance);
                    this.deploymentTests = this.deploymentTestService.getDeploymentTests(data.serviceTemplateInstance);
                    const breadCrumbs = [];
                    breadCrumbs.push({label: 'Applications', routerLink: '/applications'});
                    breadCrumbs.push(
                        {
                            label: data.serviceTemplateInstance.csar_id,
                            routerLink: ['/applications', data.serviceTemplateInstance.csar_id]
                        });
                    breadCrumbs.push(
                        {
                            label: 'Instance: '
                                + data.serviceTemplateInstance.id
                        }
                    );
                    this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
                    this.triggerPollingForInstanceUpdates();
                },
                reason => console.error(reason));
    }

    /**
     * Destroy and clean up
     */
    ngOnDestroy(): void {
        clearTimeout(this.timeout);
    }
}
