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
import { CsarUploadReference } from '../../core/model/csar-upload-request.model';
import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { MarketplaceApplication } from '../../core/model/marketplace-application.model';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { RepositoryManagementService } from '../../core/service/repository-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { RepositoryManagementActions } from '../repository-management-actions';
import { Path } from '../../core/util/path';
import { forkJoin, Observable } from 'rxjs';

@Component({
    selector: 'opentosca-repository-overview',
    templateUrl: './repository-overview.component.html',
    styleUrls: ['./repository-overview.component.scss']
})
export class RepositoryOverviewComponent implements OnInit {
    @select(['repository', 'applications']) apps: Observable<Array<MarketplaceApplication>>;
    @select(['administration', 'repositoryAPI']) repositoryAPI: Observable<string>;

    public repositoryApiUrl: URL;
    public startCompletionProcess = false;
    public appToComplete: MarketplaceApplication;
    public linkToWineryResource: string;

    public searchTerm: string;

    constructor(
        private adminService: ConfigurationService,
        private appService: ApplicationManagementService,
        private marketService: RepositoryManagementService,
        private ngRedux: NgRedux<AppState>,
        private logger: OpenToscaLoggerService) {
    }

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push({ label: 'Repository', routerLink: 'repositories' });
        breadCrumbs.push({ label: 'OpenTOSCA Repository' });
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
        this.getApps();
        this.repositoryAPI.subscribe(url => this.repositoryApiUrl = new URL(url));
    }

    reloadApplications(): void {
        this.getApps();
    }

    navigateToRepositoryUI(): void {
        window.open(
            this.repositoryApiUrl.protocol + '//' + this.repositoryApiUrl.host + '/',
            '_blank'
        );
    }

    /**
     * Trigger install of CSAR in container via URL to CSAR
     * @param app
     */
    installInContainer(app: MarketplaceApplication): void {
        app.isInstalling = true;
        const postURL = new Path(this.adminService.getContainerUrl())
            .append('csars')
            .toString();
        const tmpApp = new CsarUploadReference(app.csarURL, app.id);
        this.marketService.installAppInContainer(tmpApp, postURL)
            .subscribe(response => {
                app.isInstalling = false;
                this.appService.isAppDeployedInContainer(app.id)
                    .then(result => app.inContainer = result);
            }, err => {
                app.isInstalling = false;
                // Injector
                if (err.status === 406) {
                    this.appToComplete = app;
                    this.linkToWineryResource = err.json()['Location'] as string;
                    this.logger.log('[marketplace.component][injection]', this.linkToWineryResource);
                    this.startCompletionProcess = true;
                } else {
                    this.appService.isAppDeployedInContainer(app.id)
                        .then(result => {
                            app.inContainer = result;
                        });
                }
            });
    }

    /**
     * Fetch apps from repository
     */
    getApps(): void {
        this.marketService.getAppsFromMarketPlace()
            .subscribe(references => {
                const appObservables = [] as Array<Observable<MarketplaceApplication>>;
                for (const reference of references) {
                    appObservables.push(this.marketService.getAppFromMarketPlace(reference, this.adminService.getRepositoryUrl()));
                }
                forkJoin(appObservables)
                    .subscribe(apps => {
                            for (const app of apps) {
                                this.appService.isAppDeployedInContainer(app.id)
                                    .then(result => app.inContainer = result);
                            }
                            this.ngRedux.dispatch(RepositoryManagementActions.addRepositoryApplications(apps));
                        },
                        reason => this.logger.handleError('[marketplace-overview.component][getApps]', reason)
                    );
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

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }
}
