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
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';
import { ModalDirective } from 'ng2-bootstrap';
import { PlanParameter } from '../shared/model/plan-parameter.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PlanOperationMetaData } from '../shared/model/planOperationMetaData.model';
import { ApplicationDetail } from '../shared/model/application-detail.model';
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { OpenTOSCAUiActions } from '../redux/actions';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../redux/store';
import { GrowlMessageBusService } from '../shared/growl-message-bus.service';
import { Error } from 'tslint/lib/error';
import { Observable } from 'rxjs';
import { TriggerTerminationPlanEvent } from '../shared/model/trigger-termination-plan-event.model';
import * as _ from 'lodash';
import { ApplicationInstancesService } from '../shared/application-instances.service';
import { OpenToscaLogger } from '../shared/util/OpenToscaLogger';
import { Path } from '../shared/util/Path';

@Component({
    selector: 'opentosca-application-details',
    templateUrl: 'application-details.component.html',
    animations: [
        trigger('fadeInOut', [
            state('in', style({'opacity': 1})),
            transition('void => *', [
                style({'opacity': 0}),
                animate('500ms ease-out')
            ]),
            transition('* => void', [
                style({'opacity': 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
})

export class ApplicationDetailsComponent implements OnInit, OnDestroy {

    public app: Application;
    @select(['container', 'currentAppInstances']) currentAppInstances: Observable<Array<any>>;
    public buildPlanOperationMetaData: PlanOperationMetaData;
    public selfserviceApplicationUrl: SafeUrl;
    public planOutputParameters: {OutputParameter: PlanParameter}[];
    public provisioningInProgress = false;
    public provisioningDone = false;
    public allInputsFilled = true;
    private serviceTemplateInstancesURL: string;

    @ViewChild('childModal') public childModal: ModalDirective;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService,
                private sanitizer: DomSanitizer,
                private ngRedux: NgRedux<AppState>,
                private messageBus: GrowlMessageBusService,
                private logger: OpenToscaLogger,
                private router: Router,
                private appInstancesService: ApplicationInstancesService) {
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
        let breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Applications', '/applications'));
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateBreadcrumb(breadCrumbs));
        this.route.data
            .subscribe((data: {applicationDetail: ApplicationDetail}) => {
                this.ngRedux.dispatch(OpenTOSCAUiActions.updateCurrentApplication(data.applicationDetail.app));
                this.app = data.applicationDetail.app;
                this.ngRedux.dispatch(OpenTOSCAUiActions.updateBuildPlanOperationMetaData(data.applicationDetail.buildPlanParameters));
                this.buildPlanOperationMetaData = data.applicationDetail.buildPlanParameters;
                this.serviceTemplateInstancesURL = _.trimEnd(data.applicationDetail.terminationPlanResource.Reference.href, '%7BinstanceId%7D');
                this.appInstancesService.loadInstancesList(data.applicationDetail.app.id)
                    .subscribe(result => this.ngRedux.dispatch(OpenTOSCAUiActions.updateApplicationInstances(result)));
                this.ngRedux.dispatch(OpenTOSCAUiActions.appendBreadcrumb(new BreadcrumbEntry(data.applicationDetail.app.id, '')));
            },
            reason => {
                this.messageBus.emit(
                    {
                        severity: 'warn',
                        summary: 'Loading of Data failed',
                        detail: 'Loading of data for the selected app failed. Please try to load it again. Server returned: ' + JSON.stringify(reason)
                    }
                );
                this.router.navigate(['/applications']);
            });
    }

    ngOnDestroy(): void {
        this.ngRedux.dispatch(OpenTOSCAUiActions.clearApplicationInstances());
        this.ngRedux.dispatch(OpenTOSCAUiActions.clearCurrentApplication());
    }

    emitTerminationPlan(terminationEvent: TriggerTerminationPlanEvent): void {
        let url = new Path(this.serviceTemplateInstancesURL)
            .append(terminationEvent.instanceID).toString();

        this.appService.deleteApplicationInstance(url)
            .then(result => {
                this.appInstancesService.loadInstancesList(this.app.id)
                    .subscribe(result => this.ngRedux.dispatch(OpenTOSCAUiActions.updateApplicationInstances(result)));
                this.messageBus.emit(
                    {
                        severity: 'success',
                        summary: 'Instance Successfully Terminated',
                        detail: 'The instance ' + url + ' was sucessfully terminated.'
                    }
                );
                this.logger.log('[application.details.component][emitTerminationPlan]', result);
            })
            .catch(err => {
                this.messageBus.emit(
                    {
                        severity: 'error',
                        summary: 'Failure at Instance Termination',
                        detail: 'The instance ' + url + ' was not terminated successfully. Container returned: '
                            + JSON.stringify(err)
                    }
                );
                this.logger.handleError('[application.details.component][emitTerminationPlan]', err);
            });
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
                this.logger.log('[application-details.component][startProvisioning]', 'Received result after post ' + JSON.stringify(response));
                this.logger.log('[application-details.component][startProvisioning]', 'Now starting to poll for service template instance creation');
                this.appService.pollForServiceTemplateInstanceCreation(response.PlanURL)
                    .then(urlToServiceTemplateInstance => {
                        this.logger.log(
                            '[application-details.component][startProvisioning]',
                            'ServiceTemplateInstance created: ' + urlToServiceTemplateInstance);
                        let urlToPlanInstanceOutput = new Path(urlToServiceTemplateInstance)
                            .append('PlanInstances')
                            .append(this.extractCorrelationID(response.PlanURL))
                            .append('Output')
                            .toString();

                        let urlToPlanInstanceState = new Path(urlToServiceTemplateInstance)
                            .append('PlanInstances')
                            .append(this.extractCorrelationID(response.PlanURL))
                            .append('State')
                            .toString();

                        this.logger.log('[application-details.component][startProvisioning]',
                            'Now staring to poll for build plan completion: ' + urlToPlanInstanceState);

                        this.appService.pollForPlanFinish(urlToPlanInstanceState)
                            .then(result => {
                                this.appInstancesService.loadInstancesList(this.app.id)
                                    .subscribe(result => this.ngRedux.dispatch(OpenTOSCAUiActions.updateApplicationInstances(result)));
                                // we received the plan result
                                // go find and present selfServiceApplicationUrl to user
                                this.logger.log('[application-details.component][startProvisioning]', 'Received plan result: ' + JSON.stringify(result));
                                this.appService.getPlanOutput(urlToPlanInstanceOutput)
                                    .then(planOutput => {
                                        for (let para of planOutput.OutputParameters) {
                                            if (para.OutputParameter.Name === 'selfserviceApplicationUrl') {
                                                this.selfserviceApplicationUrl = this.sanitizer.bypassSecurityTrustUrl(para.OutputParameter.Value);
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
        } else {
            return '';
        }
    }

    /**
     * Checks if out parameter should be shown as result for users after provisioning
     * @param param
     * @returns {boolean}
     */
    showOutputParameter(param: {OutputParameter: PlanParameter}): boolean {
        return (!(param.OutputParameter.Name === 'instanceId' ||
        param.OutputParameter.Name === 'CorrelationID'));
    }

    /**
     * Check if all input fields are filled and enable button
     * @returns {boolean}
     */
    checkAllInputsFilled(): boolean {
        if (this.buildPlanOperationMetaData) {
            for (let par of this.buildPlanOperationMetaData.Plan.InputParameters) {
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
