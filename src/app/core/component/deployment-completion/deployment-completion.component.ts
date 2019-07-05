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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {MarketplaceApplication} from '../../model/marketplace-application.model';
import {LoggerService} from '../../service/logger.service';
import {InjectionOption} from '../../model/injection-option.model';
import {DeploymentCompletionService} from '../../service/deployment-completion.service';
import {InjectionOptionsResponse} from '../../model/injection-options-response.model';
import {MenuItem, SelectItem} from 'primeng/api';

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

    // Array of Injection Options for Host Completion
    public hostCompletionOptions: Array<InjectionOption> = null;
    // Array of Injection Options for Connection Completion
    public connectionCompletionOptions: Array<InjectionOption> = null;
    // Injection Options Response object containing the selected options for completion
    public completionSelection: InjectionOptionsResponse = {
        'hostInjections': {},
        'connectionInjections': {}
    };

    // menu item array for storing the steps of the dialog
    public items: MenuItem[];
    // select item array for host selection value for dropdown
    public hostOptions: SelectItem[] = [];
    // counter of values for host selection dropdown to dynamically set panel to correct height
    public amountOfHostOptions = 1;
    // boolean to check if a valid host was selected, button to proceed is disabled if this is false
    public validHostSelected = false;
    // select item array for connection selection value for dropdown
    public connectOptions: SelectItem[] = [];
    // counter of values for connection selection dropdown to dynamically set panel to correct height
    public amountOfConnectOptions = 1;
    // boolean to check if a valid connection was selected, button to proceed is disabled if this is false
    public validConnectSelected = false;

    // active index of the step dialog
    public activeIndex = 0;
    // array of strings containing the text of the button to go a step forward
    public stepsTextArray: string[] = ['Proceed Completion',
        'Confirm Host selection', 'Confirm Connection Selection', 'Confirm Upload'];

    constructor(private completionService: DeploymentCompletionService,
                private router: Router,
                private logger: LoggerService) {
    }


    ngOnInit() {
        // initialize dropdown for host options
        this.hostOptions.push({label: '', value: null});
        // initialize dropdown for connection options
        this.connectOptions.push({label: '', value: null});
        // fetch injection options with link to winery repo
        this.getInjectionOptions(this.linkToWineryResource);
        console.log(this.linkToWineryResource);
        // array with steps for completion dialog
        this.items = [
            {label: 'Step 1 - Disclaimer'},
            {label: 'Step 2 - Selection of Hosts'},
            {label: 'Step 3 - Selection of Connections'},
            {label: 'Step 4 - Confirmation'}
        ];
    }

    ngAfterViewInit(): void {
    }

    /**
     * This method is called when the completion is aborted.
     * It dismisses the dialog and emits an abort event.
     */
    abortCompletion(): void {
        // dismiss dialog
        this.visible = false;
        // emit the abort of the completion as event
        this.completionAbort.emit();
    }

    /**
     * This method is called when the step forward button is clicked in the steps dialog.
     * It sets the active step index accordingly.
     */
    goToNextStep(): void {
        // check if current step is confirmation step
        if (this.activeIndex === 3) {
            // inject selected hosts
            this.injectNewHosts();
        // for every other step, just increase active index
        } else {
            this.activeIndex += 1;
        }
    }

    /**
     * This method is called when the dropdown value of the host selection is changed.
     * It binds the selected value to the completion selection.
     * @param completionOption: Node Template which requires a host
     * @param event: event generated when the selected value in the dropdown changes
     */
    onUpdateHostSelection(completionOption, event) {
        // check if selected value is not null, i.e. not the initialization value
        if (event.value !== null) {
            // extract value of selection
            const selectedValue = event.value;
            // set completion selection for the current host to the selected value
            this.completionSelection['hostInjections'][completionOption.nodeID] = selectedValue;
            // valid host was selected, set to true
            this.validHostSelected = true;
        // if selected value is null, i.e. the initialization value
        } else {
            // non valid host was selected, set to false
            this.validHostSelected = false;
        }
    }

    /**
     * This method is called when the dropdown value of the connection selection is changed.
     * It binds the selected value to the completion selection
     * @param completionOption: Template with open requirement
     * @param event: event generated when the selected value in the dropdown changes
     */
    onUpdateConnectionSelection(completionOption, event) {
        // check if selected value is not null, i.e. not the initialization value
        if (event.value != null) {
            // extract value of selection
            const selectedValue = event.value;
            // set completion selection for the current connection to the selected value
            this.completionSelection['connectionInjections'][completionOption.nodeID] = selectedValue;
            // valid connection was selected, set to true
            this.validConnectSelected = true;
        // if selected value is null, i.e. the initialization value
        } else {
            // non valid connection was selected, set to false
            this.validConnectSelected = false;
        }
    }

    /**
     * This method fetches the possible injection options for an incomplete CSAR.
     * @param linkToWineryResource: URL to Winery repo
     */
    getInjectionOptions(linkToWineryResource: string): void {
        // call completion service to get injection options
        this.completionService.getInjectionOptions(linkToWineryResource)
            .then(injectionOptions => {
                // check if CSAR is complete, i.e. no injection options available
                if (injectionOptions == null) {
                    // emit a completion success event
                    this.completionSuccess.emit(this.appToComplete);
                    // dismiss dialog
                    this.visible = false;
                // if CSAR is incomplete
                } else {
                    // get host injection options, i.e. node templates requiring a host and possible values
                    this.hostCompletionOptions = injectionOptions.hostInjectionOptions;
                    // get connection injection options, i.e. rel templates with open requirement and possible values
                    this.connectionCompletionOptions = injectionOptions.connectionInjectionOptions;
                    this.logger.log('[deployment-completion.component][getInjectionOptions]', 'Got host completion options: '
                        + JSON.stringify(this.hostCompletionOptions));
                }
            // after getting the injection options, fill the dropdown with the fetched values
            }).then(() => {
            // iterate over node templates requiring a host
            for (const hostOption of this.hostCompletionOptions) {
                // iterate over possible values for completion of a host
                for (const hOption of hostOption.injectionOptionTopologyFragments) {
                    // add possible value to host options array to display in dropdown
                    this.hostOptions.push({
                        label: hOption.documentation[0].content[0],
                        value: hOption
                    });
                    // increment amount of host options to set height of panel accordingly to display all values
                    this.amountOfHostOptions += 1;
                }
            }
            // iterate over rel templates with open requirement
            for (const connectionOption of this.connectionCompletionOptions) {
                // iterate over possible values for completion of connection
                for (const cOption of connectionOption.injectionOptionTopologyFragments) {
                    // add possible value to connect options array to display in dropdown
                    this.connectOptions.push({
                        label: cOption.documentation[0].content[0],
                        value: cOption
                    });
                    // increment amount of connect options to set height of panel accordingly to display all values
                    this.amountOfConnectOptions += 1;
                }
            }
        });
    }

    /**
     * This method is called after user selected the values for completion.
     * It injects the selection to complete the CSAR.
     */
    injectNewHosts(): void {
        this.logger.log('[deployment-completion.component][injectNewHosts]', 'Injecting new hosts: '
            + JSON.stringify(this.completionSelection));
        // call completion service to inject options with completion selection of user
        this.completionService.injectNewHosts(this.linkToWineryResource, this.completionSelection)
        // wait for completion of injection
            .then(injectedServiceTemplateURL => {
                // get URL of CSAR to complete
                this.appToComplete.csarURL = injectedServiceTemplateURL.substr(0, injectedServiceTemplateURL.lastIndexOf('/')) + '?csar';
                this.logger.log('[deployment-completion.component][newCSARURLForInstallation]', this.appToComplete.csarURL);
                // emit completion success event
                this.completionSuccess.emit(this.appToComplete);
                // dismiss dialog
                this.visible = false;
            })
            // catch error in case of failure
            .catch(err => {
                this.logger.handleError('[deployment-completion.component][injectNewHosts]', err);
                // emit error while completion
                this.completionError.emit(err);
            });
    }

}
