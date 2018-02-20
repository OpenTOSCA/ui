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
import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { ConfigurationService } from '../configuration.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import 'rxjs/add/operator/debounceTime';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';

@Component({
  selector: 'opentosca-configuration-management',
  templateUrl: './configuration-management.component.html',
  styleUrls: ['./configuration-management.component.scss']
})
export class ConfigurationManagementComponent implements OnInit {

    @select(['administration', 'buildPlanPath']) buildPlanPath: Observable<string>;
    public buildPlanPathControl: FormControl = new FormControl();
    @select(['administration', 'terminationPlanPath']) terminationPlanPath: Observable<string>;
    public terminationPlanPathControl: FormControl = new FormControl();
    @select(['administration', 'containerAPI']) containerAPI: Observable<string>;
    public containerAPIControl: FormControl = new FormControl();
    public containerAPIAvailable: boolean;
    @select(['administration', 'repositoryAPI']) repositoryAPI: Observable<string>;
    public repositoryAPIControl: FormControl = new FormControl();
    public repositoryAPIAvailable: boolean;

    constructor(private configService: ConfigurationService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit(): void {

        const breadCrumbs = [];
        breadCrumbs.push({label: 'Administration'});
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));

        this.containerAPI.subscribe(value => this.checkAvailabilityOfContainer());
        this.repositoryAPI.subscribe(value => this.checkAvailabilityOfRepository());

        this.containerAPIControl.valueChanges
            .debounceTime(500)
            .subscribe(newValue => this.updateContainerURL(newValue));
        this.repositoryAPIControl.valueChanges
            .debounceTime(500)
            .subscribe(newValue => this.updateRepositoryURL(newValue));
        this.buildPlanPathControl.valueChanges
            .debounceTime(500)
            .subscribe(newValue => this.updateBuildPlanPath(newValue));
        this.terminationPlanPathControl.valueChanges
            .debounceTime(500)
            .subscribe(newValue => this.updateTerminationPlanPath(newValue));
    }

    /**
     * Checks if container API responds
     */
    checkAvailabilityOfContainer(): void {
        this.configService.isContainerAvailable()
            .then(success => this.containerAPIAvailable = true)
            .catch(err => this.containerAPIAvailable = false);
    }

    /**
     * Checks if repository API responds
     */
    checkAvailabilityOfRepository(): void {
        this.configService.isRepositoryAvailable()
            .then(success => this.repositoryAPIAvailable = true)
            .catch(err => this.repositoryAPIAvailable = false);
    }

    /**
     * Delegates update of build plan path to AdministrationService
     * @param newValue
     */
    updateBuildPlanPath(newValue: string): void {
        this.configService.setBuildPlanPath(newValue);
        this.logger.log('[administration.component][updateBuildPlanPath] Updated build plan path to: ',
            this.configService.getBuildPlanPath());
    }

    /**
     * Delegates update of termination plan path to AdministrationService
     * @param newValue
     */
    updateTerminationPlanPath(newValue: string): void {
        this.configService.setTerminationPlanPath(newValue);
        this.logger.log('[administration.component][updateTerminationPlanPath] Updated termination plan path to: ',
            this.configService.getTerminationPlanPath());
    }

    /**
     * Delegates update of container API URL to AdministrationService
     * @param newValue
     */
    updateContainerURL(newValue: string): void {
        this.configService.setContainerAPIURL(newValue);
        this.logger.log('[administration.component][updateRepositoryURL] Updated container URL to: ',
            this.configService.getContainerAPIURL());
    }

    /**
     * Delegates update of repository API URL to AdministrationService
     * @param newValue
     */
    updateRepositoryURL(newValue: string): void {
        this.configService.setWineryAPIURL(newValue);
        this.logger.log('[administration.component][updateRepositoryURL] Updated repository URL to: ',
            this.configService.getWineryAPIURL());
    }
}
