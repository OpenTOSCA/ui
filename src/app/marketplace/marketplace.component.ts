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
 *     Jasmin Guth - initial implementation
 */

import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { MarketplaceService } from '../shared/marketplace.service';
import { AdministrationService } from '../administration/administration.service';

import { ApplicationService } from '../shared/application.service';
import { MarketplaceApplication } from '../shared/model/marketplace-application.model';
import { NgRedux, select } from 'ng2-redux';
import { IAppState } from '../redux/store';
import { OpenTOSCAUiActions } from '../redux/actions';
import { Observable } from 'rxjs';
import { ErrorHandler } from "../shared/helper/handleError";

@Component({
    selector: 'opentosca-marketplace',
    templateUrl: 'marketplace.component.html',
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

export class MarketplaceComponent implements OnInit {
    @select(['repository', 'applications']) apps: Observable<Array<MarketplaceApplication>>;

    public showLoader = false;

    constructor(private adminService: AdministrationService,
                private appService: ApplicationService,
                private marketService: MarketplaceService,
                private ngRedux: NgRedux<IAppState>) {
    }

    ngOnInit(): void {
        this.getApps();
    }

    /**
     * Trigger install of CSAR in container via URL to CSAR
     * @param app
     */
    installInContainer(app: MarketplaceApplication): void {
        this.showLoader = true;
        this.marketService.installAppInContainer(app.csarURL, this.adminService.getContainerAPIURL())
            .then(response => {
                this.showLoader = false;
                this.containerContainsApp(app)
                    .then(result => app.inContainer = result)
                    .catch(result => app.inContainer = result);
            })
            .catch(err => {
                this.showLoader = false;
                this.containerContainsApp(app)
                    .then(result => app.inContainer = result)
                    .catch(result => app.inContainer = result);
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
                                .then(result => app.inContainer = result)
                                .catch(reason => {
                                    app.inContainer = false;
                                    ErrorHandler.handleError('[marketplace.component][getApps][isAppDeployedInContainer]', reason);
                                });
                        }
                        this.ngRedux.dispatch(OpenTOSCAUiActions.addRepositoryApplications(apps));
                    })
                    .catch(reason => ErrorHandler.handleError('[marketplace.component][getApps]', reason));
            });
    }

    /**
     * Check if app is already installed in container
     * @param app
     * @returns {Promise<boolean>}
     */
    containerContainsApp(app: MarketplaceApplication): Promise<boolean> {
        console.log('CHECKING APP: ', JSON.stringify(app));
        return this.appService.getAppDescription(app.id)
            .then(cApp => {
                console.log('CHECKED APP: ', app.id, true);
                return true;
            })
            .catch(err => {
                console.log('CHECKED APP: ', app.id, false);
                return false;
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
