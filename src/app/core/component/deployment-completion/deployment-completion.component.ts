/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Karoline Saatkamp - initial implementation
 */
import {Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {NgRedux} from '@angular-redux/store';
import {ModalDirective} from 'ngx-bootstrap';
import {MarketplaceApplication} from '../../model/marketplace-application.model';
import {ConfigurationService} from '../../../configuration/configuration.service';
import {RepositoryManagementService} from '../../service/repository-management.service';
import {ApplicationManagementService} from '../../service/application-management.service';
import {OpenToscaLoggerService} from '../../service/open-tosca-logger.service';
import {GrowlMessageBusService} from '../../service/growl-message-bus.service';
import {AppState} from '../../../store/app-state.model';
import {InjectionOption} from '../../model/injection-option.model';
import {DeploymentCompletionService} from '../../service/deployment-completion.service';

@Component({
    selector: 'opentosca-ui-deployment-completion',
    templateUrl: 'deployment-completion.component.html',
})
export class DeploymentCompletionComponent implements OnInit, AfterViewInit {
    @Input('appToComplete') appToComplete: MarketplaceApplication;
    @Input('linkToWineryResource') linkToWineryResource: string;
    @Output('completionSuccessful') completionSuccessful = new EventEmitter<MarketplaceApplication>();
    @ViewChild('completeConfirmationModal') public completeConfirmationModal: ModalDirective;
    @ViewChild('completeSelectionModal') public completeSelectionModal: ModalDirective;

    public completeApp = false;
    public hostCompletionOptions: Array<InjectionOption> = null;
    public connectionCompletionOptions: Array<InjectionOption> = null;
    public completionSelection: any = {
        'hostInjections': {},
        'connectionInjections': {}
    };

    constructor(private configurationService: ConfigurationService,
                private repositoryManagementService: RepositoryManagementService,
                private applicationManagementService: ApplicationManagementService,
                private completionService: DeploymentCompletionService,
                private messageBus: GrowlMessageBusService,
                private ngRedux: NgRedux<AppState>,
                private router: Router,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit() {
        // this.completeConfirmationModal.show();
    }

    ngAfterViewInit(): void {
        this.completeConfirmationModal.show();
        this.logger.log('[deployment-completion.service][onInit]', this.appToComplete.displayName);
        console.log(this.appToComplete);
    }

    adaptRouteBackToMarketPlace(): void {
        this.router.navigate(['../repository']);
    }


    cancelCompleteConfirmationModal(): void {
        this.completeConfirmationModal.hide();
    }

    showCompleteSelectionModel(): void {
        this.completeConfirmationModal.hide();
        this.completeSelectionModal.show();
    }

    cancelCompleteSelectionModal(): void {
        this.completeSelectionModal.hide();
    }

    startCompletion(): void {
        this.completeApp = true;
        this.getInjectionOptions(this.linkToWineryResource);
        this.showCompleteSelectionModel();
    }

    getInjectionOptions(linkToWineryResource: string): void {
        this.completionService.getInjectionOptions(linkToWineryResource)
            .then(injectionOptions => {

                if (injectionOptions == null) {
                    this.completionSuccessful.emit(this.appToComplete);
                    this.completeSelectionModal.hide();
                } else {
                    this.hostCompletionOptions = injectionOptions.hostInjectionOptions;
                    this.connectionCompletionOptions = injectionOptions.connectionInjectionOptions;
                    console.log('Das sind die Host Completion Options');
                    console.log(this.hostCompletionOptions);
                }
            });
    }

    injectNewHosts(): void {
        console.log(JSON.stringify(this.completionSelection));
        this.completionService.injectNewHosts(this.linkToWineryResource, this.completionSelection)
            .then(injectedServiceTemplateURL => {
                this.appToComplete.csarURL = injectedServiceTemplateURL.substr(0, injectedServiceTemplateURL.lastIndexOf('/')) + '?csar';
                this.logger.log('[deployment-completion.component][newCSARURLForInstallation]', this.appToComplete.csarURL);
                this.sleep(6000);
                this.completionSuccessful.emit(this.appToComplete);
                this.completeSelectionModal.hide();
            })
            .catch(err => {
                this.logger.handleError('[deployment-completion.component][injectNewHosts]', err);
            });
    }

    sleep(milliseconds: any) {
        const start = new Date().getTime();
        for (let i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }
}
