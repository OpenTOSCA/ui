import {Component, OnInit, ViewChild, trigger, state, style, transition, animate} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ApplicationService} from '../shared/application.service';
import {Application} from '../shared/application.model';
import {ModalDirective} from '../../../node_modules/ng2-bootstrap/components/modal/modal.component';
import {PlanParameter} from '../shared/plan-parameter.model';
import {PlanParameters} from '../shared/plan-parameters.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
    selector: 'opentosca-application-details',
    templateUrl: 'src/app/application-details/application-details.component.html',
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
    public buildPlanParameters: PlanParameters;
    public selfserviceApplicationUrl: SafeUrl;
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

    public showChildModal(): void {
        this.childModal.show();
    }

    public hideChildModal(): void {
        this.childModal.hide();
    }

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
                            console.error('Did not receive a selfserviceApplicationUrl');
                        }
                        this.provisioningDone = true;
                        this.provisioningInProgress = false;
                    })
                    .catch(this.handleError);
            })
            .catch(this.handleError);
    }


    showParam(param: PlanParameter) {
        return (param.Name === 'CorrelationID' ||
        param.Name === 'csarName' ||
        param.Name === 'containerApiAddress' ||
        param.Name === 'instanceDataAPIUrl' ||
        param.Name === 'planCallbackAddress_invoker' ||
        param.Name === 'csarEntrypoint') ? false : true;
    }

    /**
     * Print errors to console
     * @param error
     * @returns {Promise<void>|Promise<T>}
     */
    private handleError(error: any): Promise<any> {
        this.resetProvisioningState();
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    private resetProvisioningState(): void {
        this.provisioningDone = true;
        this.provisioningInProgress = false;
        this.selfserviceApplicationUrl = '';
    }
}
