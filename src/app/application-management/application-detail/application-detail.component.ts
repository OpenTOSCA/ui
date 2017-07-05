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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Application } from '../../core/model/application.model';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { PlanOperationMetaData } from '../../core/model/planOperationMetaData.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PlanParameter } from '../../core/model/plan-parameter.model';
import { ModalDirective } from 'ngx-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbEntry } from '../../core/model/breadcrumb.model';
import { ApplicationDetail } from '../../core/model/application-detail.model';
import * as _ from 'lodash';
import { TriggerTerminationPlanEvent } from '../../core/model/trigger-termination-plan-event.model';
import { Path } from '../../core/util/path';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { GrowlMessageBusService } from '../../core/service/growl-message-bus.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { ApplicationInstancesManagementService } from '../../core/service/application-instances-management.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';

@Component({
    selector: 'opentosca-ui-application-detail',
    templateUrl: './application-detail.component.html',
    styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {

    public app: Application;
    @select(['container', 'currentAppInstances']) currentAppInstances: Observable<Array<any>>;
    public buildPlanOperationMetaData: PlanOperationMetaData;
    public selfserviceApplicationUrl: SafeUrl;
    public planOutputParameters: { OutputParameter: PlanParameter }[];
    public provisioningInProgress = false;
    public provisioningDone = false;
    public allInputsFilled = true;
    private serviceTemplateInstancesURL: string;
    public terminationPlan: PlanOperationMetaData;

    @ViewChild('childModal') public childModal: ModalDirective;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationManagementService,
                private sanitizer: DomSanitizer,
                private ngRedux: NgRedux<AppState>,
                private messageBus: GrowlMessageBusService,
                private logger: OpenToscaLoggerService,
                private router: Router,
                private appInstancesService: ApplicationInstancesManagementService) {
    }

    /**
     * Checks if given param should be shown in the start privisioning dialog
     * @param param
     * @returns {boolean}
     */
    public showParam(param: PlanParameter): boolean {
        return (!(param.Name === 'CorrelationID' ||
        param.Name === 'csarID' ||
        param.Name === 'serviceTemplateID' ||
        param.Name === 'containerApiAddress' ||
        param.Name === 'instanceDataAPIUrl' ||
        param.Name === 'planCallbackAddress_invoker' ||
        param.Name === 'csarEntrypoint'));
    }

    /**
     * Initialize component by extracting csar id from route params,
     * then load app description and build plan parameters
     */
    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Applications', '/applications'));
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
        this.route.data
            .subscribe((data: { applicationDetail: ApplicationDetail }) => {
                    this.ngRedux.dispatch(ApplicationManagementActions.updateCurrentApplication(data.applicationDetail.app));
                    this.app = data.applicationDetail.app;
                    this.ngRedux.dispatch(ApplicationManagementActions.updateBuildPlanOperationMetaData(
                        data.applicationDetail.buildPlanParameters));
                    this.buildPlanOperationMetaData = data.applicationDetail.buildPlanParameters;
                    this.serviceTemplateInstancesURL = _.trimEnd(
                        data.applicationDetail.terminationPlanResource.Reference.href,
                        '%7BinstanceId%7D'
                    );
                    this.terminationPlan = data.applicationDetail.terminationPlanResource;
                    this.appInstancesService.loadInstancesList(data.applicationDetail.app.id)
                        .subscribe(result => this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationInstances(result)));
                    this.ngRedux.dispatch(BreadcrumbActions.appendBreadcrumb(new BreadcrumbEntry(data.applicationDetail.app.id, '')));
                },
                reason => {
                    this.messageBus.emit(
                        {
                            severity: 'warn',
                            summary: 'Loading of Data failed',
                            detail: 'Loading of data for the selected app failed. Please try to load it again. Server returned: ' +
                            JSON.stringify(reason)
                        }
                    );
                    this.router.navigate(['/applications']);
                });
    }

    ngOnDestroy(): void {
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationInstances());
        this.ngRedux.dispatch(ApplicationManagementActions.clearCurrentApplication());
    }

    emitTerminationPlan(terminationEvent: TriggerTerminationPlanEvent): void {
        this.appService.getServiceTemplatePathNG(this.app.id).subscribe(serviceTemplatePath => {
            const instanceId = terminationEvent.instanceID;
            const plan = this.terminationPlan.Plan.ID;
            const url = new Path(serviceTemplatePath)
                .append('instances')
                .append(instanceId)
                .append('managementplans')
                .append(plan)
                .append('instances')
                .toString();
            this.appService.getServiceTemplatePath(this.app.id).subscribe(path => {
                // const oldApiUrl = new Path(path).append('Instances').append(instanceId).toString();
                // const parameters = [{
                //     "name": "OpenTOSCAContainerAPIServiceInstanceID",
                //     "type": "String",
                //     "required": "YES",
                //     "value": oldApiUrl
                // }];
                this.appService.triggerPlan(url, []);
                this.messageBus.emit({
                    severity: 'success',
                    summary: 'Termination successfully started',
                    detail: 'The termination process has been started.'
                });
            });
        });
        // this.appService.deleteApplicationInstance(url)
        //     .then(result => {
        //         this.appInstancesService.loadInstancesList(this.app.id)
        //             .subscribe(instancesList => this.ngRedux.dispatch(
        //                 ApplicationManagementActions.updateApplicationInstances(instancesList)));
        //         this.messageBus.emit(
        //             {
        //                 severity: 'success',
        //                 summary: 'Instance Successfully Terminated',
        //                 detail: 'The instance ' + url + ' was sucessfully terminated.'
        //             }
        //         );
        //         this.logger.log('[application.details.component][emitTerminationPlan]', result);
        //     })
        //     .catch(err => {
        //         this.messageBus.emit(
        //             {
        //                 severity: 'error',
        //                 summary: 'Failure at Instance Termination',
        //                 detail: 'The instance ' + url + ' was not terminated successfully. Container returned: '
        //                 + JSON.stringify(err)
        //             }
        //         );
        //         this.logger.handleError('[application.details.component][emitTerminationPlan]', err);
        //     });
    }

    /**
     * Shows modal to key in required buildplan parameters and start provisioning
     */
    public showChildModal(): void {
        this.childModal.show();
    }

    /**
     * Hides modal key in required buildplan parameters and start provisioning
     */
    public hideChildModal(): void {
        this.childModal.hide();
    }

    /**
     * Delegates the provisioning of a new instance to the ApplicationService
     * and hides the modal
     */
    startProvisioning(): void {
        this.hideChildModal();
        this.selfserviceApplicationUrl = '';
        this.provisioningInProgress = true;
        this.provisioningDone = false;
        this.appService.startProvisioning(this.app.id, this.buildPlanOperationMetaData)
            .then(response => {
                this.logger.log(
                    '[application-details.component][startProvisioning]',
                    'Received result after post ' + JSON.stringify(response)
                );
                this.logger.log(
                    '[application-details.component][startProvisioning]',
                    'Now starting to poll for service template instance creation'
                );
                this.appService.pollForServiceTemplateInstanceCreation(response.PlanURL)
                    .then(urlToServiceTemplateInstance => {
                        this.logger.log(
                            '[application-details.component][startProvisioning]',
                            'ServiceTemplateInstance created: ' + urlToServiceTemplateInstance);
                        const urlToPlanInstanceOutput = new Path(urlToServiceTemplateInstance)
                            .append('PlanInstances')
                            .append(this.extractCorrelationID(response.PlanURL))
                            .append('Output')
                            .toString();

                        const urlToPlanInstanceState = new Path(urlToServiceTemplateInstance)
                            .append('PlanInstances')
                            .append(this.extractCorrelationID(response.PlanURL))
                            .append('State')
                            .toString();

                        this.logger.log('[application-details.component][startProvisioning]',
                            'Now staring to poll for build plan completion: ' + urlToPlanInstanceState);

                        this.appService.pollForPlanFinish(urlToPlanInstanceState)
                            .then(result => {
                                this.appInstancesService.loadInstancesList(this.app.id)
                                    .subscribe(list => this.ngRedux.dispatch(
                                        ApplicationManagementActions.updateApplicationInstances(list)));
                                // we received the plan result
                                // go find and present selfServiceApplicationUrl to user
                                this.logger.log(
                                    '[application-details.component][startProvisioning]',
                                    'Received plan result: ' + JSON.stringify(result)
                                );
                                this.appService.getPlanOutput(urlToPlanInstanceOutput)
                                    .then(planOutput => {
                                        for (const para of planOutput.OutputParameters) {
                                            if (para.OutputParameter.Name === 'selfserviceApplicationUrl') {
                                                this.selfserviceApplicationUrl = this.sanitizer.bypassSecurityTrustUrl(
                                                    para.OutputParameter.Value
                                                );
                                                this.messageBus.emit(
                                                    {
                                                        severity: 'success',
                                                        summary: 'New Instance Provisioned',
                                                        detail: 'A new instance of ' + this.app.id +
                                                        ' was provisioned. Launch via: ' +
                                                        para.OutputParameter.Value
                                                    }
                                                );
                                            }
                                        }
                                        if (this.selfserviceApplicationUrl === '') {
                                            this.planOutputParameters = planOutput.OutputParameters;
                                            this.messageBus.emit(
                                                {
                                                    severity: 'success',
                                                    summary: 'New Instance Provisioned',
                                                    detail: 'A new instance of ' + this.app.id +
                                                    ' was provisioned. Result is: ' +
                                                    JSON.stringify(planOutput.OutputParameters)
                                                }
                                            );
                                            this.logger.log(
                                                '[application-details.component][startProvisioning]',
                                                'Did not receive a selfserviceApplicationUrl');
                                        }
                                    })
                                    .catch(err => {
                                        this.emitProvisioningErrorMessage(err);
                                        this.logger.handleError('[application-details.component][startProvisioning]', err);
                                    });
                                this.provisioningDone = true;
                                this.provisioningInProgress = false;
                            })
                            .catch(err => {
                                this.emitProvisioningErrorMessage(err);
                                this.logger.handleError('[application-details.component][startProvisioning][pollForResults]', err);
                            });
                    })
                    .catch(err => {
                        this.emitProvisioningErrorMessage(err);
                        this.logger.handleError('[application-details.component][startProvisioning]', err);
                    });
            })
            .catch(err => {
                this.emitProvisioningErrorMessage(err);
                this.logger.handleError('[application-details.component][startProvisioning]', err);
            });
    }

    emitProvisioningErrorMessage(err: Error): void {
        this.messageBus.emit(
            {
                severity: 'error',
                summary: 'Failure at Provisioning',
                detail: 'The provisioning of a new instance of ' + this.app.id + ' was not successfull. Error is: ' + JSON.stringify(err)
            }
        );
    }

    extractCorrelationID(queryString: string): string {
        if (queryString.lastIndexOf('=') >= 0) {
            return queryString.substring(queryString.lastIndexOf('=') + 1);
        }
        else {
            return '';
        }
    }

    /**
     * Checks if out parameter should be shown as result for users after provisioning
     * @param param
     * @returns {boolean}
     */
    showOutputParameter(param: { OutputParameter: PlanParameter }): boolean {
        return (!(param.OutputParameter.Name === 'instanceId' ||
        param.OutputParameter.Name === 'CorrelationID'));
    }

    /**
     * Check if all input fields are filled and enable button
     * @returns {boolean}
     */
    checkAllInputsFilled(): boolean {
        if (this.buildPlanOperationMetaData) {
            for (const par of this.buildPlanOperationMetaData.Plan.InputParameters) {
                if (!(par.InputParameter.Value) && this.showParam(par.InputParameter)) {
                    return this.allInputsFilled = true;
                }
            }
            return this.allInputsFilled = false;
        }
    }

    /**
     * Reset all state variables
     */
    private resetProvisioningState(): void {
        this.provisioningDone = true;
        this.provisioningInProgress = false;
        this.selfserviceApplicationUrl = '';
    }
}
