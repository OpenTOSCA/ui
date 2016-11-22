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
    public containerAPIAvailable: boolean;
    public repositoryAPI: string;
    public repositoryAPIAvailable: boolean;

    constructor(private adminService: AdministrationService) {
    }

    ngOnInit(): void {
        // TODO: check if containerAPI and winery API is available
        this.buildPlanPath = this.adminService.getBuildPlanPath();
        this.containerAPI = this.adminService.getContainerAPIURL();
        this.repositoryAPI = this.adminService.getWineryAPIURL();
        this.checkAvailabilityOfContainer();
        this.checkAvailabilityOfRepository();
    }

    checkAvailabilityOfContainer(): void {
        this.adminService.isContainerAvailable()
            .then(success => this.containerAPIAvailable = true)
            .catch(err => this.containerAPIAvailable = false);
    }

    checkAvailabilityOfRepository(): void {
        this.adminService.isRepositoryAvailable()
            .then(success => this.repositoryAPIAvailable = true)
            .catch(err => this.repositoryAPIAvailable = false);
    }

    updateBuildPlanPath(newValue: string): void {
        this.buildPlanPath = newValue;
        this.adminService.setBuildPlanPath(this.buildPlanPath);
        console.log(this.adminService.getBuildPlanPath());
    }

    updateContainerURL(newValue: string): void {
        this.containerAPI = newValue;
        this.adminService.setContainerAPIURL(this.containerAPI);
        this.checkAvailabilityOfContainer();
        console.log(this.adminService.getContainerAPIURL());
    }

    updateRepositoryURL(newValue: string): void {
        this.repositoryAPI = newValue;
        this.adminService.setWineryAPIURL(this.repositoryAPI);
        this.checkAvailabilityOfRepository();
        console.log(this.adminService.getWineryAPIURL());
    }
}
