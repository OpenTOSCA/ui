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

@Component({
    selector: 'opentosca-repository',
    templateUrl: './repository.component.html',
    styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit {

    @select(['administration', 'repositoryItems']) repositoryItems: Observable<Array<Item>>;
    @select(['repository', 'selectedRepository']) selectedRepository: Observable<Item>;

    repositoryItems$: Array<Item> = [];
    selectedRepository$: Item;

    apps: Array<MarketplaceApplication> = [];

    searchTerm: string;

    constructor(private ngRedux: NgRedux<AppState>, private repositoryService: RepositoryService,
                private configurationService: ConfigurationService, private applicationService: ApplicationManagementService,
                private logger: LoggerService) {
    }

    ngOnInit() {
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
            { label: 'Repository', routerLink: ['/repository'] },
            // { label: 'OpenTOSCA', routerLink: ['/repository'] }
        ]));
        this.repositoryItems.subscribe(items => this.repositoryItems$ = items);
        this.selectedRepository.subscribe(item => {
            this.selectedRepository$ = item;
            if (this.selectedRepository$ === null) {
                this.selectedRepository$ = this.repositoryItems$[0];
                this.selectRepository();
            }
            this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
                { label: 'Repository', routerLink: ['/repository'] },
                { label: this.selectedRepository$.name, routerLink: ['/repository'] }
            ]));
            this.refresh();
        });
    }

    selectRepository() {
        this.apps = [];
        this.ngRedux.dispatch(RepositoryActions.setSelectedRepository(this.selectedRepository$));
    }

    trackFn(index: number, app: MarketplaceApplication) {
        return app.id;
    }

    refresh(): void {
        this.repositoryService.getApplications(this.selectedRepository$.url)
            .subscribe(refs => {
                const o = [] as Array<Observable<MarketplaceApplication>>;
                for (const reference of refs) {
                    o.push(this.repositoryService.getApplication(reference, this.selectedRepository$.url));
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

// install(app: MarketplaceApplication): void {
//     app.isInstalling = true;
//     const postURL = new Path(this.configurationService.getContainerUrl())
//         .append('csars')
//         .toString();
//     const tmpApp = new CsarUploadReference(app.csarURL, app.id);
//     this.repositoryService.installApplication(tmpApp, postURL)
//         .subscribe(() => {
//             app.isInstalling = false;
//             this.applicationService.isApplicationInstalled(app.id)
//                 .then(result => app.inContainer = result);
//         }, err => {
//             app.isInstalling = false;
//             // Injector
//             if (err.status === 406) {
//                 // TODO
//                 // this.appToComplete = app;
//                 // this.linkToWineryResource = err.json()['Location'] as string;
//                 // this.logger.log('[marketplace.component][injection]', this.linkToWineryResource);
//                 // this.showCompletionDialog = true;
//             } else {
//                 this.ngRedux.dispatch(GrowlActions.addGrowl({
//                     severity: 'error',
//                     summary: 'Error installing application in OpenTOSCA Container',
//                     detail: err.message
//                 }));
//                 this.applicationService.isApplicationInstalled(app.id)
//                     .then(result => {
//                         app.inContainer = result;
//                     });
//             }
//         });
// }
}
