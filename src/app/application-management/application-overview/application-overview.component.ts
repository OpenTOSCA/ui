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

@Component({
    selector: 'opentosca-application-overview',
    templateUrl: './application-overview.component.html',
    styleUrls: ['./application-overview.component.scss']
})
export class ApplicationOverviewComponent implements OnInit {

    @select(['container', 'applications']) public readonly apps: Observable<Array<Csar>>;

    public searchTerm: string;

    constructor(private applicationService: ApplicationManagementService, private confirmationService: ConfirmationService,
                private ngRedux: NgRedux<AppState>, private logger: LoggerService) {
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

    confirmDeletion(csar: Csar): void {
        this.confirmationService.confirm({
            message: `Do you really want to delete the application "${csar.display_name}"?`,
            accept: () => {
                this.logger.log('[applications-overview.component][deleteApplication]', 'Trying to delete the following App: ' + csar.id);
                this.deleteApplication(csar);
            }
        });
    }

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
                this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(apps));
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
