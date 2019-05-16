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
import { Component, OnInit } from '@angular/core';
import { BreadcrumbActions } from '../core/component/breadcrumb/breadcrumb-actions';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../store/app-state.model';
import { forkJoin, Observable } from 'rxjs';
import { RepositoryService } from '../core/service/repository.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { ApplicationManagementService } from '../core/service/application-management.service';
import { LoggerService } from '../core/service/logger.service';
import { Item } from '../configuration/repository-configuration/repository-configuration.component';
import { RepositoryActions } from './repository-actions.service';
import { MarketplaceApplication } from '../core/model/marketplace-application.model';
import { CsarUploadReference } from '../core/model/csar-upload-request.model';
import { Path } from '../core/path';
import { GrowlActions } from '../core/growl/growl-actions';

@Component({
    selector: 'opentosca-repository',
    templateUrl: './repository.component.html',
    styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit {

    @select(['administration', 'repositoryItems']) repositoryItems$: Observable<Array<Item>>;
    @select(['repository', 'selectedRepository']) selectedRepository$: Observable<Item>;

    repositoryItems: Array<Item> = [];
    selectedRepository: Item;

    apps: Array<MarketplaceApplication> = [];

    searchTerm: string;

    public linkToWineryResourceForCompletion: string;
    public appToComplete: MarketplaceApplication;
    public showCompletionDialog = false;
    public initializeCompletionComponent = false;

    constructor(private ngRedux: NgRedux<AppState>, private repositoryService: RepositoryService,
                private configurationService: ConfigurationService, private applicationService: ApplicationManagementService,
                private logger: LoggerService, private adminService: ConfigurationService, private repoService: RepositoryService ) {
    }

    ngOnInit() {
        this.repositoryItems$.subscribe(items => this.repositoryItems = items);
        this.selectedRepository$.subscribe(item => {
            this.selectedRepository = item;
            if (this.selectedRepository === null) {
                this.selectedRepository = this.repositoryItems[0];
                this.selectRepository();
            }
            this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
                { label: 'Repository', routerLink: ['/repository'] },
                { label: this.selectedRepository.name, routerLink: ['/repository'] }
            ]));
            this.refresh();
        });
    }

    selectRepository() {
        this.apps = [];
        this.ngRedux.dispatch(RepositoryActions.setSelectedRepository(this.selectedRepository));
    }

    trackFn(index: number, app: MarketplaceApplication) {
        return app.id;
    }

    refresh(): void {
        this.apps = [];
        this.repositoryService.getApplications(this.selectedRepository.url)
            .subscribe(refs => {
                const o = [] as Array<Observable<MarketplaceApplication>>;
                for (const reference of refs) {
                    o.push(this.repositoryService.getApplication(reference, this.selectedRepository.url));
                }
                forkJoin(o)
                    .subscribe(apps => {
                            for (const app of apps) {
                                this.applicationService.isApplicationInstalled(app.id)
                                    .then(result => app.inContainer = result);
                            }
                            this.apps = apps;
                        },
                        reason => this.logger.handleError('[repository.component][refresh]', reason)
                    );
            });
    }

    openRepository(url: string): void {
        const _url: URL = new URL(url);
        window.open(_url.protocol + '//' + _url.host + '/', '_blank');
    }

    openApplication(url: string): void {
        window.open(url, '_blank');
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }

    install(app: MarketplaceApplication): void {
        app.isInstalling = true;
        const url = new Path(this.configurationService.getContainerUrl()).append('csars').toString();
        const app$ = new CsarUploadReference(app.csarURL, app.id);
        this.repositoryService.installApplication(app$, url)
            .subscribe(() => {
                app.isInstalling = false;
                this.applicationService.isApplicationInstalled(app.id)
                    .then(result => app.inContainer = result);
            }, err => {
                app.isInstalling = false;
                if (err.status === 406) {
                    this.appToComplete = app;
                    this.appToComplete.csarName = app$.name;
                    this.linkToWineryResourceForCompletion = err.error.Location;
                    this.logger.log('[marketplace.component][injection]', this.linkToWineryResourceForCompletion);
                    this.initializeCompletionComponent = true;
                    this.showCompletionDialog = true;
                } else {
                    this.ngRedux.dispatch(GrowlActions.addGrowl({
                        severity: 'error',
                        summary: 'Error installing application in OpenTOSCA Container',
                        detail: err.message
                    }));
                    this.applicationService.isApplicationInstalled(app.id)
                        .then(result => {
                            app.inContainer = result;
                        });
                }
            });
    }

    /**
     * Handler for successful completion of completion component.
     */
    onCompletionSuccess(app: MarketplaceApplication): void {
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'success',
                summary: 'Completion Succeeded',
                detail: `The completion process was successful, app "${app.displayName}" is now getting installed in container.`
            }
        ));
        // Todo: Container should check itself if the app already exists and respond appropriately
        const postURL = new Path(this.adminService.getContainerUrl())
            .append('csars')
            .toString();
        const completedApp = new CsarUploadReference(app.csarURL, app.csarName);
        this.repoService.installApplication(completedApp, postURL)
            .subscribe(() => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Completed Application Installed',
                        detail: `The completed app "${app.displayName}" was successfully installed in container.`
                    }
                ));
            }, err => {
                this.logger.error('[application-overview.component][completionSuccess]', err);
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: `The completed app "${app.displayName}" was not installed successfully in container: ${err}.`
                    }
                ));
            });
    }

    /**
     * Handler for emitted errors of completion component
     */
    onCompletionError(errorMessage: string): void {
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'error',
                summary: 'Error',
                detail: 'Error at Topology Completion: ' + errorMessage
            }
        ));
        this.stopCompletionProcess();
    }

    onCompletionAbort(): void {
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'info',
                summary: 'Info',
                detail: 'Topology Completion aborted.'
            }
        ));
        this.stopCompletionProcess();
    }

    /**
     * Hides the completion dialog
     */
    stopCompletionProcess(): void {
        this.showCompletionDialog = false;
        this.appToComplete = null;
        this.linkToWineryResourceForCompletion = null;
    }
}
