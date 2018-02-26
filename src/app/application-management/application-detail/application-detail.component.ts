/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *     Michael Wurster - initial implementation
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationDetail } from '../../core/model/application-detail.model';
import * as _ from 'lodash';
import { TriggerTerminationPlanEvent } from '../../core/model/trigger-termination-plan-event.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { ApplicationInstancesManagementService } from '../../core/service/application-instances-management.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';
import { Csar } from '../../core/model/new-api/csar.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { Plan } from '../../core/model/new-api/plan.model';
import { AppComponent } from '../../app.component';

@Component({
    selector: 'opentosca-application-detail',
    templateUrl: './application-detail.component.html',
    styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {

    @select(['container', 'currentApp']) app: Observable<Csar>;
    @select(['container', 'currentBuildPlan']) currentBuildPlan: Observable<Plan>;
    public provisioningInProgress = false;
    public provisioningDone = false;
    public allInputsFilled = true;
    public showStartProvisioningModal = false;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationManagementService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService,
                private router: Router,
                private appInstancesService: ApplicationInstancesManagementService) {
    }

    /**
     * Checks if given param should be shown in the start privisioning dialog
     * @param name
     * @returns {boolean}
     */
    public showParam(name: string): boolean {
        return (!(name === 'CorrelationID' ||
        name === 'csarID' ||
        name === 'serviceTemplateID' ||
        name === 'containerApiAddress' ||
        name === 'instanceDataAPIUrl' ||
        name === 'planCallbackAddress_invoker' ||
        name === 'csarEntrypoint'));
    }

    /**
     * Initialize component by extracting csar id from route params,
     * then load app description and build plan parameters
     */
    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push({label: 'Applications', routerLink: 'applications'});
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
        this.route.data
            .subscribe((data: { applicationDetail: ApplicationDetail }) => {
                    this.ngRedux.dispatch(ApplicationManagementActions.updateCurrentApplication(data.applicationDetail.app));
                    this.ngRedux.dispatch(ApplicationManagementActions.updateBuildPlan(
                        data.applicationDetail.buildPlan)
                    );
                    this.ngRedux.dispatch(ApplicationManagementActions.updateTerminationPlan(
                        data.applicationDetail.terminationPlan
                    ));
                    // Load also application instances for list
                    this.updateAppInstancesList(data.applicationDetail.app);
                    // Prepare breadcrumb
                    this.ngRedux.dispatch(BreadcrumbActions.appendBreadcrumb(
                        {
                            label: data.applicationDetail.app.id,
                            routerLink: ['applications', data.applicationDetail.app.id]
                        }));
                },
                reason => {
                    this.ngRedux.dispatch(GrowlActions.addGrowl(
                        {
                            severity: 'warn',
                            summary: 'Loading of Data failed',
                            detail: 'Loading of data for the selected app failed. Please try to load it again. Server returned: ' +
                            JSON.stringify(reason)
                        }
                    ));

                    this.router.navigate(['/applications']);
                });
    }

    ngOnDestroy(): void {
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationInstance());
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationInstances());
        this.ngRedux.dispatch(ApplicationManagementActions.clearCurrentApplication());
    }

    emitTerminationPlan(terminationEvent: TriggerTerminationPlanEvent): void {
        const terminationPlan = Object.assign({}, this.ngRedux.getState().container.currentTerminationPlan);
        terminationPlan._links['self'].href = _.replace(terminationPlan._links['self'].href, ':id', terminationEvent.instanceID);
        console.log(terminationPlan);
        this.appService.triggerTerminationPlan(terminationPlan)
            .subscribe(result => {
                // TODO Location header is filled with correct plan instance url but is not accessible in a http 201 response
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

    triggerUpdateAppInstancesList(): void {
        this.updateAppInstancesList(this.ngRedux.getState().container.currentApp);
    }

    updateAppInstancesList(app: Csar): void {
        this.appInstancesService.getServiceTemplateInstancesOfCsar(app)
            .subscribe(result => {
                this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationInstances(result));
            });
    }

    /**
     * Shows modal to key in required buildplan parameters and start provisioning
     */
    public showProvisioningModal(): void {
        this.showStartProvisioningModal = true;
    }

    /**
     * Hides modal key in required buildplan parameters and start provisioning
     */
    public hideProvisioningModal(): void {
        this.showStartProvisioningModal = false;
    }

    /**
     * Delegates the provisioning of a new instance to the ApplicationService
     * and hides the modal
     */
    startProvisioning(): void {
        this.hideProvisioningModal();
        this.provisioningInProgress = true;
        this.provisioningDone = false;
        const app = this.ngRedux.getState().container.currentApp;
        this.appService.triggerBuildPlan(this.ngRedux.getState().container.currentBuildPlan)
            .subscribe(location => {
                this.logger.log(
                    '[application-details.component][startProvisioning]',
                    'Received result after post ' + JSON.stringify(location)
                );
                this.logger.log(
                    '[application-details.component][startProvisioning]',
                    'Now starting to poll for service template instance creation'
                );
                // we wait for two seconds so that servicetemplate instance is created
                setTimeout(() => this.triggerUpdateAppInstancesList(), 2000);
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Provisioning started',
                        detail: 'The provisioning of a new instance of ' + app.id
                        + ' started. See instances list below for information about the new instance.'
                    }
                ));
            }, err => {
                this.emitProvisioningErrorMessage(err);
                this.logger.handleError('[application-details.component][startProvisioning]', err);
            });
    }

    emitProvisioningErrorMessage(err: Error): void {
        this.app.subscribe(app => {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Failure at Provisioning',
                    detail: 'The provisioning of a new instance of ' + app.id + ' was not successfull. Error is: ' + JSON.stringify(err)
                }
            ));
        });
    }

    /**
     * Check if all input fields are filled and enable button
     * @returns {boolean}
     */
    checkAllInputsFilled(): boolean {
        if (this.ngRedux.getState().container.currentBuildPlan) {
            for (const par of this.ngRedux.getState().container.currentBuildPlan.input_parameters) {
                if (!(par.value) && this.showParam(par.name)) {
                    return this.allInputsFilled = true;
                }
            }
            return this.allInputsFilled = false;
        }
    }
}
