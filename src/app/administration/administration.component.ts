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

import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { AdministrationService } from './administration.service';
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { OpenTOSCAUiActions } from '../redux/actions';
import { AppState } from '../redux/store';
import { NgRedux } from '@angular-redux/store';

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

    public buildPlanPath: string;
    public containerAPI: string;
    // TODO: Change containerAPIAvailable to @select using redux observable an async pipe in template
    public containerAPIAvailable: boolean;
    public repositoryAPI: string;
    // TODO: Change repositoryAPIAvailable to @select using redux observable an async pipe in template
    public repositoryAPIAvailable: boolean;

    constructor(private adminService: AdministrationService,
                private ngRedux: NgRedux<AppState>) {
    }

    ngOnInit(): void {

        let breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Administration', ''));
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateBreadcrumb(breadCrumbs));

        this.buildPlanPath = this.adminService.getBuildPlanPath();
        this.containerAPI = this.adminService.getContainerAPIURL();
        this.repositoryAPI = this.adminService.getWineryAPIURL();
        this.checkAvailabilityOfContainer();
        this.checkAvailabilityOfRepository();
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
     * Delegates update of buildplan path to AdministrationService
     * @param newValue
     */
    updateBuildPlanPath(newValue: string): void {
        this.buildPlanPath = newValue;
        this.adminService.setBuildPlanPath(this.buildPlanPath);
        console.log('[administration.component][updateRepositoryURL] Updated build plan path to: ', this.adminService.getBuildPlanPath());
    }

    /**
     * Delegates update of container API URL to AdministrationService
     * @param newValue
     */
    updateContainerURL(newValue: string): void {
        this.containerAPI = newValue;
        this.adminService.setContainerAPIURL(this.containerAPI);
        this.checkAvailabilityOfContainer();
        console.log('[administration.component][updateRepositoryURL] Updated container URL to: ', this.adminService.getContainerAPIURL());
    }

    /**
     * Delegates update of repository API URL to AdministrationService
     * @param newValue
     */
    updateRepositoryURL(newValue: string): void {
        this.repositoryAPI = newValue;
        this.adminService.setWineryAPIURL(this.repositoryAPI);
        this.checkAvailabilityOfRepository();
        console.log('[administration.component][updateRepositoryURL] Updated repository URL to: ', this.adminService.getWineryAPIURL());
    }
}
