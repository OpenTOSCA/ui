/*******************************************************************************
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *******************************************************************************/
import {Component, OnInit, trigger, state, style, transition, animate} from '@angular/core';
import {AdministrationService} from '../shared/administration.service';


@Component({
    selector: 'opentosca-administration',
    templateUrl: 'src/app/administration/administration.component.html',
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
    public repositoryAPI: string;

    constructor(private adminService: AdministrationService) {
    }

    ngOnInit(): void {
        this.buildPlanPath = this.adminService.getBuildPlanPath();
        this.containerAPI = this.adminService.getContainerAPIURL();
        this.repositoryAPI = this.adminService.getWineryAPIURL();
    }

    updateRepositoryURL(event: any): void {
        console.log(this.repositoryAPI);
        this.adminService.setWineryAPIURL(this.repositoryAPI);
        console.log(this.adminService.getWineryAPIURL());
    }


}
