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
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';
import { ApplicationManagementActions } from '../application-management-actions';
import { Observable } from 'rxjs';
import { DeploymentTestService } from '../../core/service/deployment-test.service';
import { DeploymentTest } from '../../core/model/deployment-test';
import { GrowlActions } from '../../core/growl/growl-actions';

@Component({
    selector: 'opentosca-application-instance-detail',
    templateUrl: './application-instance-detail.component.html',
    styleUrls: ['./application-instance-detail.component.scss']
})
export class ApplicationInstanceDetailComponent implements OnInit, OnDestroy {

    @select(['container', 'currentInstance'])
    instance: Observable<ServiceTemplateInstance>;

    deploymentTests: Observable<Array<DeploymentTest>>;
    serviceTemplateInstance: ServiceTemplateInstance;

    constructor(private route: ActivatedRoute,
                private ngRedux: NgRedux<AppState>, private deploymentTestService: DeploymentTestService) {
    }

    runDeploymentTests(): void {
        this.deploymentTestService.runDeploymentTest(this.serviceTemplateInstance).subscribe(response => {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'info',
                    summary: 'Running deployment tests...',
                    detail: 'Automated application deployment tests have been triggered and are run in background.'
                }
            ));
        });
    }

    refresh(): void {
        this.deploymentTests = this.deploymentTestService.getDeploymentTests(this.serviceTemplateInstance);
    }

    /**
     * Initialize component
     */
    ngOnInit(): void {
        this.route.data
            .subscribe((data: { serviceTemplateInstance: ServiceTemplateInstance }) => {
                    this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationInstance(data.serviceTemplateInstance));
                    this.serviceTemplateInstance = data.serviceTemplateInstance;
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

    ngOnDestroy(): void {
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationInstance());
    }
}
