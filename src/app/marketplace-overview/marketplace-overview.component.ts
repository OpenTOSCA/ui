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
 *     Jasmin Guth - initial implementation
 */

import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MarketplaceService } from '../shared/marketplace.service';
import { AdministrationService } from '../administration/administration.service';

import { ApplicationService } from '../shared/application.service';
import { MarketplaceApplication } from '../shared/model/marketplace-application.model';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../redux/store';
import { OpenTOSCAUiActions } from '../redux/actions';
import { Observable } from 'rxjs';
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { OpenToscaLogger } from '../shared/util/OpenToscaLogger';

@Component({
    selector: 'opentosca-marketplace',
    templateUrl: 'marketplace-overview.component.html',
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

export class MarketplaceOverviewComponent implements OnInit {
    @select(['repository', 'applications']) apps: Observable<Array<MarketplaceApplication>>;
    @select(['administration', 'repositoryAPI']) repositoryURL: Observable<string>;

    public showLoader = false;
    public repoURL: string;

    constructor(private adminService: AdministrationService,
                private appService: ApplicationService,
                private marketService: MarketplaceService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLogger) {
    }

    ngOnInit(): void {
        let breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Repository', 'marketplace'));
        breadCrumbs.push(new BreadcrumbEntry('OpenTOSCA Repository', ''));
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateBreadcrumb(breadCrumbs));
        this.getApps();
        this.repositoryURL.subscribe(url => this.repoURL = url);
    }

    navigateToRepo(): void {
        window.open(
            this.repoURL,
            '_blank'
        );
    }

    /**
     * Trigger install of CSAR in container via URL to CSAR
     * @param app
     */
    installInContainer(app: MarketplaceApplication): void {
        app.isInstalling = true;
        this.marketService.installAppInContainer(app.csarURL, this.adminService.getContainerAPIURL())
            .then(response => {
                app.isInstalling = false;
                this.appService.isAppDeployedInContainer(app.id)
                    .then(result => app.inContainer = result);
            })
            .catch(err => {
                app.isInstalling = false;
                this.appService.isAppDeployedInContainer(app.id)
                    .then(result => app.inContainer = result);
            });
    }

    /**
     * Fetch apps from repository
     */
    getApps(): void {
        this.marketService.getAppsFromMarketPlace()
            .then(references => {
                let appPromises = [] as Array<Promise<MarketplaceApplication>>;
                for (let reference of references) {
                    appPromises.push(this.marketService.getAppFromMarketPlace(reference, this.adminService.getWineryAPIURL()));
                }
                Promise.all(appPromises)
                    .then(apps => {
                        for (let app of apps) {
                            this.appService.isAppDeployedInContainer(app.id)
                                .then(result => app.inContainer = result);
                        }
                        this.ngRedux.dispatch(OpenTOSCAUiActions.addRepositoryApplications(apps));
                    })
                    .catch(reason => this.logger.handleError('[marketplace-overview.component][getApps]', reason));
            });
    }

    /**
     * Tracking for ngFor to enable tracking of id field of MarketplaceApplication
     * @param index
     * @param app
     * @returns {string}
     */
    trackAppsFn(index: number, app: MarketplaceApplication) {
        return app.id;
    }
}
