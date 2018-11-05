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
import { MarketplaceApplication } from '../core/model/marketplace-application.model';
import { forkJoin, Observable } from 'rxjs';
import { RepositoryActions } from './repository-actions.service';
import { RepositoryService } from '../core/service/repository.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { ApplicationManagementService } from '../core/service/application-management.service';
import { OpenToscaLoggerService } from '../core/service/open-tosca-logger.service';
import { Path } from '../core/util/path';
import { CsarUploadReference } from '../core/model/csar-upload-request.model';

@Component({
    selector: 'opentosca-repository',
    templateUrl: './repository.component.html',
    styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit {

    @select(['repository', 'applications']) apps: Observable<Array<MarketplaceApplication>>;
    @select(['administration', 'repositoryUrl']) repositoryUrl: Observable<string>;

    public searchTerm: string;

    constructor(private ngRedux: NgRedux<AppState>, private repositoryService: RepositoryService,
                private configurationService: ConfigurationService, private applicationService: ApplicationManagementService,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit() {
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
            { label: 'Repository', routerLink: ['/repository'] },
            { label: 'OpenTOSCA', routerLink: ['/repository'] }
        ]));
        this.refresh();
    }

    refresh(): void {
        this.repositoryService.getApplications()
            .subscribe(refs => {
                const o = [] as Array<Observable<MarketplaceApplication>>;
                for (const reference of refs) {
                    o.push(this.repositoryService.getApplication(reference, this.configurationService.getRepositoryUrl()));
                }
                forkJoin(o)
                    .subscribe(apps => {
                            for (const app of apps) {
                                this.applicationService.isAppDeployedInContainer(app.id)
                                    .then(result => app.inContainer = result);
                            }
                            this.ngRedux.dispatch(RepositoryActions.addRepositoryApplications(apps));
                        },
                        reason => this.logger.handleError('[repository.component][refresh]', reason)
                    );
            });
    }

    openRepository(): void {
        const url: URL = new URL(this.configurationService.getRepositoryUrl());
        window.open(url.protocol + '//' + url.host + '/', '_blank');
    }

    open(url): void {
        window.open(url, '_blank');
    }

    trackFn(index: number, app: MarketplaceApplication) {
        return app.id;
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }

    install(app: MarketplaceApplication): void {
        app.isInstalling = true;
        const postURL = new Path(this.configurationService.getContainerUrl())
            .append('csars')
            .toString();
        const tmpApp = new CsarUploadReference(app.csarURL, app.id);
        this.repositoryService.installApplication(tmpApp, postURL)
            .subscribe(() => {
                app.isInstalling = false;
                this.applicationService.isAppDeployedInContainer(app.id)
                    .then(result => app.inContainer = result);
            }, err => {
                app.isInstalling = false;
                // Injector
                if (err.status === 406) {
                    // TODO
                    // this.appToComplete = app;
                    // this.linkToWineryResource = err.json()['Location'] as string;
                    // this.logger.log('[marketplace.component][injection]', this.linkToWineryResource);
                    // this.startCompletionProcess = true;
                } else {
                    this.applicationService.isAppDeployedInContainer(app.id)
                        .then(result => {
                            app.inContainer = result;
                        });
                }
            });
    }
}
