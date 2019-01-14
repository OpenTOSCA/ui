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
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';
import { Csar } from '../../core/model/csar.model';
import { Plan } from '../../core/model/plan.model';
import { Observable } from 'rxjs';
import { GrowlActions } from '../../core/growl/growl-actions';
import * as _ from 'lodash';
import { ApplicationInstanceManagementService } from '../../core/service/application-instance-management.service';

@Component({
    selector: 'opentosca-application-detail',
    templateUrl: './application-detail.component.html'
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {

    @select(['container', 'application', 'csar']) csar: Observable<Csar>;
    @select(['container', 'application', 'buildPlan']) buildPlan: Observable<Plan>;
    @select(['container', 'application', 'terminationPlan']) terminationPlan: Observable<Plan>;

    public dialogVisible = false;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private ngRedux: NgRedux<AppState>,
                private appService: ApplicationManagementService,
                private instancesService: ApplicationInstanceManagementService,
                private logger: LoggerService) {
    }

    ngOnInit(): void {
        this.route.data.subscribe((data: { application: { csar: Csar, buildPlan: Plan, terminationPlan: Plan } }) => {
            // Prepare breadcrumb
            this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
                {label: 'Applications', routerLink: 'applications'},
                {label: data.application.csar.id, routerLink: ['applications', data.application.csar.id]}
            ]));
            this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationCsar(data.application.csar));
            this.ngRedux.dispatch(ApplicationManagementActions.updateBuildPlan(data.application.buildPlan));
            this.ngRedux.dispatch(ApplicationManagementActions.updateTerminationPlan(data.application.terminationPlan));
            if (data.application.buildPlan === null) {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'info',
                        summary: 'No Build Plan Available',
                        detail: 'There is no Build Plan associated with this app. No instances can be provisioned.'
                    }
                ));
            }
            this.triggerReloadAppInstances();
        }, error => {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'warn',
                    summary: 'Loading of Data failed',
                    detail: `Loading of data for the selected application failed.
                     Please try to load it again. Server returned: ${error.message}`
                }
            ));
            this.router.navigate(['/applications']);
        });
    }

    ngOnDestroy(): void {
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationInstances());
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationCsar());
    }

    triggerReloadAppInstances(): void {
        this.reloadInstances(this.ngRedux.getState().container.application.csar);
    }

    reloadInstances(app: Csar): void {
        this.instancesService.getServiceTemplateInstancesOfCsar(app)
            .subscribe(result => {
                this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationInstances(result));
            });
    }

    emitTerminationPlan(terminationEvent: string): void {
        const terminationPlan = Object.assign({}, this.ngRedux.getState().container.application.terminationPlan);
        terminationPlan._links['self'].href = _.replace(terminationPlan._links['self'].href, ':id', terminationEvent);
        console.log(terminationPlan);
        this.appService.triggerManagementPlan(terminationPlan)
            .subscribe(result => {
                this.logger.log('[application-detail.component][emitTerminationPlan]', result);
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'info',
                        summary: 'Termination started',
                        detail: 'The termination plan has been started.'
                    }
                ));
            });
    }
}
