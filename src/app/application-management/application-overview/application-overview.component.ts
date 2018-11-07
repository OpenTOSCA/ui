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

@Component({
    selector: 'opentosca-application-overview',
    templateUrl: './application-overview.component.html',
    styleUrls: ['./application-overview.component.scss']
})
export class ApplicationOverviewComponent implements OnInit {

    @select(['container', 'applications']) public readonly apps: Observable<Array<Csar>>;

    // Todo: Do something great with it... or not
    // @select(['container', 'currentApp']) app: Observable<Csar>;

    // public removingApp = false;
    // public appToDelete: Csar;
    // public showChildModal = false;

    public searchTerm: string;

    constructor(private applicationService: ApplicationManagementService,
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

    // /**
    //  * Delegate app deletion to the ApplicationService
    //  * @param app
    //  */
    // deleteFromContainer(app: Csar): void {
    //     this.removingApp = true;
    //     this.logger.log('[applications-overview.component][deleteFromContainer]', 'Trying to delete the following App: ' + app.id);
    //     this.appService.deleteApplication(app.id)
    //         .subscribe((response: Response) => {
    //             this.ngRedux.dispatch(GrowlActions.addGrowl(
    //                 {
    //                     severity: 'success',
    //                     summary: 'Deletion Successfull',
    //                     detail: 'Application ' + app.id + ' was successfully deleted.'
    //                 }
    //             ));
    //             this.logger.log('[applications-overview.component][deleteFromContainer]',
    //                 'Application successfully deleted, received response: ' + JSON.stringify(response));
    //             this.appService.getResolvedApplications()
    //                 .subscribe(result => {
    //                     this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(result));
    //                 });
    //             this.removingApp = false;
    //             this.hideDeleteConfirmationModal();
    //         }, err => {
    //             this.removingApp = false;
    //             this.hideDeleteConfirmationModal();
    //             this.ngRedux.dispatch(GrowlActions.addGrowl(
    //                 {
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Application ' + app.id +
    //                         ' was not successfully deleted. Server responded: ' + JSON.stringify(err)
    //                 }
    //             ));
    //             this.appService.getResolvedApplications()
    //                 .subscribe(result => {
    //                     this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(result));
    //                 });
    //             this.logger.handleError('[applications-overview.component][deleteFromContainer]', err);
    //             this.hideDeleteConfirmationModal();
    //         });
    // }

    // reloadApplications(): void {
    //     this.getResolvedApplications();
    // }

    // hideDeleteConfirmationModal(): void {
    //     this.showChildModal = false;
    //     this.appToDelete = null;
    // }
    //
    // showDeleteConfirmationModal(appToDelete: Csar): void {
    //     this.appToDelete = appToDelete;
    //     this.showChildModal = true;
    // }

    refresh(): void {
        this.applicationService.getResolvedApplications()
            .subscribe(apps => {
                this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(apps));
            }, reason => {
                this.logger.handleError('[applications-overview.component][getResolvedApplications]', reason);
            });
    }

    trackFn(index: number, app: Csar) {
        return app.id;
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }
}
