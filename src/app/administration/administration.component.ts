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

import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AdministrationService } from './administration.service';
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { OpenTOSCAUiActions } from '../redux/actions';
import { AppState } from '../redux/store';
import { NgRedux, select } from '@angular-redux/store';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { OpenToscaLogger } from '../shared/util/OpenToscaLogger';

@Component({
    selector: 'opentosca-administration',
    templateUrl: 'administration.component.html',
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
export class AdministrationComponent implements OnInit {

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

    constructor(private adminService: AdministrationService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLogger) {
    }

    ngOnInit(): void {

        let breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Administration', ''));
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateBreadcrumb(breadCrumbs));

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
        this.adminService.isContainerAvailable()
            .then(success => this.containerAPIAvailable = true)
            .catch(err => this.containerAPIAvailable = false);
    }

    /**
     * Checks if repository API responds
     */
    checkAvailabilityOfRepository(): void {
        this.adminService.isRepositoryAvailable()
            .then(success => this.repositoryAPIAvailable = true)
            .catch(err => this.repositoryAPIAvailable = false);
    }

    /**
     * Delegates update of build plan path to AdministrationService
     * @param newValue
     */
    updateBuildPlanPath(newValue: string): void {
        this.adminService.setBuildPlanPath(newValue);
        this.logger.log('[administration.component][updateBuildPlanPath] Updated build plan path to: ', this.adminService.getBuildPlanPath());
    }

    /**
     * Delegates update of termination plan path to AdministrationService
     * @param newValue
     */
    updateTerminationPlanPath(newValue: string): void {
        this.adminService.setTerminationPlanPath(newValue);
        this.logger.log('[administration.component][updateTerminationPlanPath] Updated termination plan path to: ', this.adminService.getTerminationPlanPath());
    }

    /**
     * Delegates update of container API URL to AdministrationService
     * @param newValue
     */
    updateContainerURL(newValue: string): void {
        this.adminService.setContainerAPIURL(newValue);
        this.logger.log('[administration.component][updateRepositoryURL] Updated container URL to: ', this.adminService.getContainerAPIURL());
    }

    /**
     * Delegates update of repository API URL to AdministrationService
     * @param newValue
     */
    updateRepositoryURL(newValue: string): void {
        this.adminService.setWineryAPIURL(newValue);
        this.logger.log('[administration.component][updateRepositoryURL] Updated repository URL to: ', this.adminService.getWineryAPIURL());
    }
}
