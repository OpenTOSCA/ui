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
import { LoggerService } from '../../service/logger.service';
import { InjectionOption } from '../../model/injection-option.model';
import { DeploymentCompletionService } from '../../service/deployment-completion.service';
import { InjectionOptionsResponse } from '../../model/injection-options-response.model';
import {MenuItem} from "primeng/api";

// Todo: Finish refactoring of deployment-completion.component and test it

@Component({
    selector: 'opentosca-deployment-completion',
    templateUrl: 'deployment-completion.component.html',
})
export class DeploymentCompletionComponent implements OnInit, AfterViewInit {
    @Input() appToComplete: MarketplaceApplication;
    @Input() linkToWineryResource: string;
    @Input() visible: boolean;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() completionSuccess = new EventEmitter<MarketplaceApplication>();
    @Output() completionAbort = new EventEmitter<void>();
    @Output() completionError = new EventEmitter<string>();

    public hostCompletionOptions: Array<InjectionOption> = null;
    public connectionCompletionOptions: Array<InjectionOption> = null;
    public completionSelection: InjectionOptionsResponse = {
        'hostInjections': {},
        'connectionInjections': {}
    };
    protected items: MenuItem[];

    constructor(private completionService: DeploymentCompletionService,
                private router: Router,
                private logger: LoggerService) {
    }



    ngOnInit() {
        this.getInjectionOptions(this.linkToWineryResource);
        this.items = [
            {label: 'Step 1 - Disclaimer'},
            {label: 'Step 2 - Select Components'},
            {label: 'Step 3 - Select Edges'},
            {label: 'Step 4 - Confirm Upload'}
        ];
    }

    ngAfterViewInit(): void {
    }

    abortCompletion(): void {
        this.visible = false;
        this.completionAbort.emit();
    }

    getInjectionOptions(linkToWineryResource: string): void {
        this.completionService.getInjectionOptions(linkToWineryResource)
            .then(injectionOptions => {
                if (injectionOptions == null) {
                    this.completionSuccess.emit(this.appToComplete);
                    this.visible = false;
                } else {
                    this.hostCompletionOptions = injectionOptions.hostInjectionOptions;
                    this.connectionCompletionOptions = injectionOptions.connectionInjectionOptions;
                    this.logger.log('[deployment-completion.component][getInjectionOptions]', 'Got host completion options: '
                        + this.hostCompletionOptions);
                }
            });
    }

    injectNewHosts(): void {
        this.logger.log('[deployment-completion.component][injectNewHosts]', 'Injecting new hosts: '
            + JSON.stringify(this.completionSelection));
        this.completionService.injectNewHosts(this.linkToWineryResource, this.completionSelection)
            .then(injectedServiceTemplateURL => {
                this.appToComplete.csarURL = injectedServiceTemplateURL.substr(0, injectedServiceTemplateURL.lastIndexOf('/')) + '?csar';
                this.logger.log('[deployment-completion.component][newCSARURLForInstallation]', this.appToComplete.csarURL);
                this.completionSuccess.emit(this.appToComplete);
                this.visible = false;
            })
            .catch(err => {
                this.logger.handleError('[deployment-completion.component][injectNewHosts]', err);
                this.completionError.emit(err);
            });
    }

}
