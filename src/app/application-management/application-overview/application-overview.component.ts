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
import { NgRedux, select } from '@angular-redux/store';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';
import { Csar } from '../../core/model/csar.model';
import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { GrowlActions } from '../../core/growl/growl-actions';
import { MarketplaceApplication } from '../../core/model/marketplace-application.model';
import { RepositoryService } from '../../core/service/repository.service';
import { Path } from '../../core/path';
import { ConfigurationService } from '../../configuration/configuration.service';

@Component({
    selector: 'opentosca-application-overview',
    templateUrl: './application-overview.component.html',
    styleUrls: ['./application-overview.component.scss']
})
export class ApplicationOverviewComponent implements OnInit {

    @select(['container', 'applications']) public readonly apps: Observable<Array<Csar>>;

    public searchTerm: string;
    public showModal = false;
    public linkToWineryResourceForCompletion: string;
    public appToComplete: MarketplaceApplication;
    public showCompletionDialog = false;

    constructor(private applicationService: ApplicationManagementService,
                private confirmationService: ConfirmationService,
                private ngRedux: NgRedux<AppState>,
                private logger: LoggerService,
                private repoService: RepositoryService,
                private adminService: ConfigurationService) {
    }

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push(
            {
                label: 'Applications',
                routerLink: ['/applications']
            }
        );
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
        this.refresh();
    }

    /**
     * Triggers confirmation dialog for app deletion.
     */
    confirmDeletion(csar: Csar): void {
        this.confirmationService.confirm({
            message: `Do you really want to delete the application "${csar.display_name}"?`,
            header: 'Remove application?',
            accept: () => {
                this.logger.log('[applications-overview.component][deleteApplication]', 'Trying to delete the following App: ' + csar.id);
                this.deleteApplication(csar);
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
        this.repoService.installApplication({ url: app.csarURL, name: app.id }, postURL)
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

    /**
     * Sends delete request to container.
     */
    deleteApplication(csar: Csar): void {
        csar.deleting$ = true;
        this.applicationService.deleteApplication(csar.id)
            .subscribe(() => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Deletion successful',
                        detail: `Application "${csar.id}" has been successfully deleted.`
                    }
                ));
                this.refresh();
            }, error => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error deleting application',
                        detail: `Application "${csar.id}" has not been deleted. Server responded: ${error.message}`
                    }
                ));
                this.logger.handleObservableError('[applications-overview.component][deleteApplication]', error);
                this.refresh();
            });
    }

    refresh(): void {
        this.applicationService.getResolvedApplications()
            .subscribe(apps => {
                this.ngRedux.dispatch(ApplicationManagementActions.updateApplications(apps));
            }, error => {
                this.logger.handleObservableError('[applications-overview.component][refresh]', error);
            });
    }

    trackFn(index: number, app: Csar) {
        return app.id;
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }
}
