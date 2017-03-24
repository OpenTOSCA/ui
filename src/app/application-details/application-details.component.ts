/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
import { Component, OnInit, ViewChild, trigger, state, style, transition, animate } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';
import { ModalDirective } from 'ng2-bootstrap';
import { PlanParameter } from '../shared/model/plan-parameter.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Logger } from '../shared/helper';
import { BuildPlanOperationMetaData } from '../shared/model/buildPlanOperationMetaData.model';
import { Path } from '../shared/helper';
import { ApplicationDetail } from '../shared/model/application-detail.model';
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { OpenTOSCAUiActions } from '../redux/actions';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../redux/store';
import { GrowlMessageBusService } from '../shared/growl-message-bus.service';
import { Error } from 'tslint/lib/error';
import { ObjectHelper } from '../shared/helper/ObjectHelper';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

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

export class ApplicationDetailsComponent implements OnInit {

    public app: Application;
    @select(['container', 'currentAppInstances']) currentAppInstances: Observable<Array<any>>;
    public buildPlanOperationMetaData: BuildPlanOperationMetaData;
    public selfserviceApplicationUrl: SafeUrl;
    public planOutputParameters: {OutputParameter: PlanParameter}[];
    public provisioningInProgress = false;
    public provisioningDone = false;
    public allInputsFilled = true;

    @ViewChild('childModal') public childModal: ModalDirective;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService,
                private sanitizer: DomSanitizer,
                private ngRedux: NgRedux<AppState>,
                private messageBus: GrowlMessageBusService) {
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
                this.buildPlanOperationMetaData = data.applicationDetail.buildPlanParameters;
                this.loadInstancesList();
                this.ngRedux.dispatch(OpenTOSCAUiActions.appendBreadcrumb(new BreadcrumbEntry(data.applicationDetail.app.displayName, '')));
            });

    }

    /**
     * Loads instances of the current app and populates appInstances array
     */
    loadInstancesList(): void {
        this.appService.getServiceTemplateInstancesByAppID(this.app.id)
            .then(result => {
                this.appService.getProvisioningStateOfServiceTemplateInstances(result)
                    .then(results => {
                        let preparedResults = [];
                        for (let res of results) {
                            let selfServiceUrl = ObjectHelper.getObjectsByPropertyDeep(res, 'selfserviceApplicationUrl');
                            if (selfServiceUrl.length > 0) {
                                _.assign(res, selfServiceUrl[0]);
                            }
                            preparedResults.push(res);
                        }
                        this.ngRedux.dispatch(OpenTOSCAUiActions.addApplicationInstances(preparedResults));
                    })
                    .catch(reason => Logger.handleError(
                        '[application-details.component][loadInstancesList][getProvisioningStateofServiceTemplateInstance]',
                        reason));
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
                Logger.log('[application-details.component][startProvisioning]', 'Received result after post ' + JSON.stringify(response));
                Logger.log('[application-details.component][startProvisioning]', 'Now starting to poll for service template instance creation');
                this.appService.pollForServiceTemplateInstanceCreation(response.PlanURL)
                    .then(urlToServiceTemplateInstance => {
                        Logger.log('[application-details.component][startProvisioning]', 'ServiceTemplateInstance created: ' + urlToServiceTemplateInstance);
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

                        Logger.log('[application-details.component][startProvisioning]',
                            'Now staring to poll for build plan completion: ' + urlToPlanInstanceState);

                        this.appService.pollForPlanFinish(urlToPlanInstanceState)
                            .then(result => {
                                this.loadInstancesList();
                                // we received the plan result
                                // go find and present selfServiceApplicationUrl to user
                                Logger.log('[application-details.component][startProvisioning]', 'Received plan result: ' + JSON.stringify(result));
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
                                            Logger.log('[application-details.component][startProvisioning]', 'Did not receive a selfserviceApplicationUrl');
                                        }
                                    })
                                    .catch(err => {
                                        this.emitProvisioningErrorMessage(err);
                                        Logger.handleError('[application-details.component][startProvisioning]', err);
                                    });
                                this.provisioningDone = true;
                                this.provisioningInProgress = false;
                            })
                            .catch(err => {
                                this.emitProvisioningErrorMessage(err);
                                Logger.handleError('[application-details.component][startProvisioning][pollForResults]', err);
                            });
                    })
                    .catch(err => {
                        this.emitProvisioningErrorMessage(err);
                        Logger.handleError('[application-details.component][startProvisioning]', err);
                    });
            })
            .catch(err => {
                this.emitProvisioningErrorMessage(err);
                Logger.handleError('[application-details.component][startProvisioning]', err);
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
