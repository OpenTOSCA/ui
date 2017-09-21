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
 *     Karoline Saatkamp - add deployment completion functionality
 */
import { CsarUploadReference } from '../../core/model/new-api/csar-upload-request.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { MarketplaceApplication } from '../../core/model/marketplace-application.model';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { RepositoryManagementService } from '../../core/service/repository-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { RepositoryManagementActions } from '../repository-management-actions';
import { Path } from '../../core/util/path';

@Component({
  selector: 'opentosca-ui-repository-overview',
  templateUrl: './repository-overview.component.html',
  styleUrls: ['./repository-overview.component.scss']
})
export class RepositoryOverviewComponent implements OnInit {
    @select(['repository', 'applications']) apps: Observable<Array<MarketplaceApplication>>;
    @select(['administration', 'repositoryAPI']) repositoryURL: Observable<string>;

    public repoURL: string;
    public startCompletionProcess = false;
    public appToComplete: MarketplaceApplication;
    public linkToWineryResource: string;

    public searchTerm: string;

    constructor(private adminService: ConfigurationService,
                private appService: ApplicationManagementService,
                private marketService: RepositoryManagementService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push({label: 'Repository', routerLink: 'repositories'});
        breadCrumbs.push({label: 'OpenTOSCA Repository'});
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
        this.getApps();
        this.repositoryURL.subscribe(url => this.repoURL = url);
    }

    reloadApplications(): void {
        this.getApps();
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
        const postURL = new Path(this.adminService.getContainerAPIURL())
            .append('csars')
            .toString();
        const tmpApp = new CsarUploadReference(app.csarURL, app.id);
        this.marketService.installAppInContainer(tmpApp, postURL)
            .then(response => {
                app.isInstalling = false;
                this.appService.isAppDeployedInContainer(app.id)
                    .then(result => app.inContainer = result);
            })
            .catch(err => {
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
            .then(references => {
                const appPromises = [] as Array<Promise<MarketplaceApplication>>;
                for (const reference of references) {
                    appPromises.push(this.marketService.getAppFromMarketPlace(reference, this.adminService.getWineryAPIURL()));
                }
                Promise.all(appPromises)
                    .then(apps => {
                        for (const app of apps) {
                            this.appService.isAppDeployedInContainer(app.id)
                                .then(result => app.inContainer = result);
                        }
                        this.ngRedux.dispatch(RepositoryManagementActions.addRepositoryApplications(apps));
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

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }
}
