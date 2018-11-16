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
import { Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'opentosca-application-instance-detail',
    templateUrl: './application-instance-detail.component.html',
    styleUrls: ['./application-instance-detail.component.scss']
})
export class ApplicationInstanceDetailComponent implements OnInit {

    deploymentTests: Observable<Array<DeploymentTest>>;
    serviceTemplateInstance: ServiceTemplateInstance;
    planInstances: Array<PlanInstance>;

    constructor(private route: ActivatedRoute,
                private ngRedux: NgRedux<AppState>,
                private deploymentTestService: DeploymentTestService,
                private instanceService: ApplicationInstanceManagementService,
                private logger: LoggerService) {
    }

    reloadAppInstance(): void {
        this.instanceService.getServiceTemplateInstance(this.route.snapshot.paramMap.get('id'),
            this.route.snapshot.paramMap.get('instanceId'))
            .subscribe(result => this.serviceTemplateInstance = result);
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

    triggerUpdatePlanInstances(): void {
        this.updatePlanInstances(this.ngRedux.getState().container.application.csar, this.serviceTemplateInstance);
    }

    triggerUpdate(): void {
        this.triggerUpdatePlanInstances();
        this.reloadAppInstance();
    }

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
     * Initialize component
     */
    ngOnInit()
        :
        void {
        this.route.data
            .subscribe((data: { serviceTemplateInstance: ServiceTemplateInstance }) => {
                    this.serviceTemplateInstance = data.serviceTemplateInstance;
                    this.updatePlanInstances(this.ngRedux.getState().container.application.csar, this.serviceTemplateInstance);
                    this.deploymentTests = this.deploymentTestService.getDeploymentTests(data.serviceTemplateInstance);
                    const breadCrumbs = [];
                    breadCrumbs.push({ label: 'Applications', routerLink: '/applications' });
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
                },
                reason => console.log('WRONG'));
    }
}
