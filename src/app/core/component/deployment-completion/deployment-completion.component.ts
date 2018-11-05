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
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceApplication } from '../../model/marketplace-application.model';
import { OpenToscaLoggerService } from '../../service/open-tosca-logger.service';
import { InjectionOption } from '../../model/injection-option.model';
import { DeploymentCompletionService } from '../../service/deployment-completion.service';

@Component({
    selector: 'opentosca-deployment-completion',
    templateUrl: 'deployment-completion.component.html',
})
export class DeploymentCompletionComponent implements OnInit, AfterViewInit {
    @Input() appToComplete: MarketplaceApplication;
    @Input() linkToWineryResource: string;
    @Output() completionSuccessful = new EventEmitter<MarketplaceApplication>();

    public showCompleteConfirmationModal = true;
    public showCompleteSelectionModal = false;

    public completeApp = false;
    public hostCompletionOptions: Array<InjectionOption> = null;
    public connectionCompletionOptions: Array<InjectionOption> = null;
    public completionSelection: any = {
        'hostInjections': {},
        'connectionInjections': {}
    };

    constructor(private completionService: DeploymentCompletionService,
                private router: Router,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.showCompleteConfirmationModal = true;
        console.log(this.appToComplete);
    }

    adaptRouteBackToMarketPlace(): void {
        this.router.navigate(['../repository']);
    }


    cancelCompleteConfirmationModal(): void {
        this.showCompleteConfirmationModal = false;
    }

    showCompleteSelectionModel(): void {
        this.showCompleteConfirmationModal = false;
        this.showCompleteSelectionModal = true;
    }

    cancelCompleteSelectionModal(): void {
        this.showCompleteSelectionModal = false;
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
                    this.showCompleteSelectionModal = false;
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
                this.completionSuccessful.emit(this.appToComplete);
                this.showCompleteSelectionModal = false;
            })
            .catch(err => {
                this.logger.handleError('[deployment-completion.component][injectNewHosts]', err);
            });
    }

}
