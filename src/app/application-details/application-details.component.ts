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
import { ErrorHandler } from '../shared/helper';
import { BuildPlanOperationMetaData } from '../shared/model/buildPlanOperationMetaData.model';
import { Path } from '../shared/helper/Path';

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
    public buildPlanOperationMetaData: BuildPlanOperationMetaData;
    public selfserviceApplicationUrl: SafeUrl;
    public planOutputParameters: {OutputParameter: PlanParameter}[];
    public provisioningInProgress = false;
    public provisioningDone = false;
    public allInputsFilled = true;

    @ViewChild('childModal') public childModal: ModalDirective;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService,
                private sanitizer: DomSanitizer) {
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
        this.route.params
            .subscribe(params => {
                this.appService.getAppDescription(params['id'])
                    .then(app => this.app = app);
                this.appService.getBuildPlanParameters(params['id'])
                    .then(planParameters => {
                        this.buildPlanOperationMetaData = planParameters;
                        console.log(planParameters);
                    });
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
                console.log('Received post result: ' + JSON.stringify(response));
                console.log('Now starting to poll for plan results');
                /*
                 1. use response.PlanURL to poll on instances ressource via query
                 2. if returned array.length === 2 then we can use that ResourceReference to
                 3. append PlanInstances/<CorrelationID>/State for polling the final result
                 4. if State returns finished then we can reveive the planoutput via PlanInstances/<CorrelationID>/Output
                 */
                this.appService.pollForServiceTemplateInstanceCreation(response.PlanURL)
                    .then(urlToServiceTemplateInstance => {
                        console.log('ServiceTemplateInstance created: ', urlToServiceTemplateInstance);
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

                        this.appService.pollForPlanFinish(urlToPlanInstanceState)
                            .then(result => {
                                // we received the plan result
                                // go find and present selfServiceApplicationUrl to user
                                console.log('Received plan result: ' + JSON.stringify(result));
                                this.appService.getPlanOutput(urlToPlanInstanceOutput)
                                    .then(planOutput => {
                                        for (let para of planOutput.OutputParameters) {
                                            if (para.OutputParameter.Name === 'selfserviceApplicationUrl') {
                                                this.selfserviceApplicationUrl = this.sanitizer.bypassSecurityTrustUrl(para.OutputParameter.Value);
                                            }
                                        }
                                        if (this.selfserviceApplicationUrl === '') {
                                            this.planOutputParameters = planOutput.OutputParameters;
                                            console.log('Did not receive a selfserviceApplicationUrl');
                                        }
                                    })
                                    .catch(err => ErrorHandler.handleError('[application-details.component][startProvisioning]', err));
                                this.provisioningDone = true;
                                this.provisioningInProgress = false;
                            })
                            .catch(err => ErrorHandler.handleError('[application-details.component][startProvisioning][pollForResults]', err));
                    })
                    .catch(err => ErrorHandler.handleError('[application-details.component][startProvisioning]', err));
            })
            .catch(err => ErrorHandler.handleError('[application-details.component][startProvisioning]', err));
    }

    extractCorrelationID(queryString: string): string {
        if (queryString.lastIndexOf('=') >= 0) {
            return queryString.substring(queryString.lastIndexOf('=') + 1);
        } else {
            return '';
        }
    }

    /**
     * Can be used to set dummy plan output parameters for testing purposes
     */
    setDummyOutput(): void {
        this.planOutputParameters = [
            {
                OutputParameter: {
                    'Name': 'MQTTTopicName',
                    'Type': 'String',
                    'Value': 'falkisTopic',
                    'Required': 'yes'
                }
            },
            {
                OutputParameter: {
                    'Name': 'MQTTBrokerEndpoint',
                    'Type': 'String',
                    'Value': '129.69.214.245',
                    'Required': 'yes'
                }
            }
        ];
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
