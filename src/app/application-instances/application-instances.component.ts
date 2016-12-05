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
import { ActivatedRoute, Params } from '@angular/router';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { PlanParameter } from '../shared/model/plan-parameter.model';
import { PlanParameters } from '../shared/model/plan-parameters.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'opentosca-application-instances',
    templateUrl: 'application-instances.component.html',
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

export class ApplicationInstancesComponent implements OnInit {

    public app: Application;
    public buildPlanParameters: PlanParameters;
    public selfserviceApplicationUrl: SafeUrl;
    public planOutputParameters: {OutputParameter: PlanParameter}[];
    public provisioningInProgress = false;
    public provisioningDone = false;

    @ViewChild('childModal') public childModal: ModalDirective;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService,
                private sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            this.appService.getAppDescription(params['id'])
                .then(app => this.app = app);
            this.appService.getBuildPlanParameters(params['id'])
                .then(planParameters => {
                    this.buildPlanParameters = planParameters;
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
        this.appService.startProvisioning(this.app.id, this.buildPlanParameters)
            .then(response => {
                console.log('Received post result: ' + JSON.stringify(response));
                console.log('Now starting to poll for plan results');
                this.appService.pollForResult(response.PlanURL)
                    .then(result => {
                        // we received the plan result
                        // go find and present selfServiceApplicationUrl to user
                        console.log('Received plan result: ' + JSON.stringify(result));
                        for (let para of result.OutputParameters) {
                            if (para.OutputParameter.Name === 'selfserviceApplicationUrl') {
                                this.selfserviceApplicationUrl = this.sanitizer.bypassSecurityTrustUrl(para.OutputParameter.Value);
                            }
                        }
                        if (this.selfserviceApplicationUrl === '') {
                            this.planOutputParameters = result.OutputParameters;
                            console.log('Did not receive a selfserviceApplicationUrl');
                        }
                        this.provisioningDone = true;
                        this.provisioningInProgress = false;
                    })
                    .catch(this.handleError);
            })
            .catch(this.handleError);
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
     * Checks if given param should be shown in the start privisioning dialog
     * @param param
     * @returns {boolean}
     */
    showParam(param: PlanParameter) {
        return (!(param.Name === 'CorrelationID' ||
        param.Name === 'csarName' ||
        param.Name === 'containerApiAddress' ||
        param.Name === 'instanceDataAPIUrl' ||
        param.Name === 'planCallbackAddress_invoker' ||
        param.Name === 'csarEntrypoint'));
    }

    /**
     * Print errors to console
     * @param error
     * @returns {Promise<void>|Promise<any>}
     */
    private handleError(error: any): Promise<any> {
        this.resetProvisioningState();
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
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
