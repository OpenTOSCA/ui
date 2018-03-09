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
 */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';
import { Csar } from '../../core/model/csar.model';
import { GrowlActions } from '../../core/growl/growl-actions';
import { MarketplaceApplication } from '../../core/model/marketplace-application.model';

@Component({
    selector: 'opentosca-application-overview',
    templateUrl: './application-overview.component.html',
    styleUrls: ['./application-overview.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ApplicationOverviewComponent implements OnInit {
    @select(['container', 'applications']) public readonly apps: Observable<Array<Csar>>;

    public removingApp = false;
    public appToDelete: Csar;
    public searchTerm: string;
    public showChildModal = false;

    constructor(private appService: ApplicationManagementService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push(
            {
                label: 'Applications',
                routerLink: ['applications']
            }
        );
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
        this.getResolvedApplications();
    }

    /**
     * Delegate app deletion to the ApplicationService
     * @param app
     */
    deleteFromContainer(app: Csar): void {
        this.removingApp = true;
        this.logger.log('[applications-overview.component][deleteFromContainer]', 'Trying to delete the following App: ' + app.id);
        this.appService.deleteAppFromContainer(app.id)
            .subscribe((response: Response) => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Deletion Successfull',
                        detail: 'Application ' + app.id + ' was successfully deleted.'
                    }
                ));
                this.logger.log('[applications-overview.component][deleteFromContainer]',
                    'Application successfully deleted, received response: ' + JSON.stringify(response));
                this.appService.getResolvedApplications()
                    .subscribe(result => {
                        this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(result));
                    });
                this.removingApp = false;
                this.hideDeleteConfirmationModal();
            }, err => {
                this.removingApp = false;
                this.hideDeleteConfirmationModal();
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application ' + app.id +
                        ' was not successfully deleted. Server responded: ' + JSON.stringify(err)
                    }
                ));
                this.appService.getResolvedApplications()
                    .subscribe(result => {
                        this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(result));
                    });
                this.logger.handleError('[applications-overview.component][deleteFromContainer]', err);
                this.hideDeleteConfirmationModal();
            });
    }

    reloadApplications(): void {
        this.getResolvedApplications();
    }

    hideDeleteConfirmationModal(): void {
        this.showChildModal = false;
        this.appToDelete = null;
    }

    showDeleteConfirmationModal(appToDelete: Csar): void {
        this.appToDelete = appToDelete;
        this.showChildModal = true;
    }

    /**
     * Load applications from container containing all meta data
     */
    getResolvedApplications(): void {
        this.appService.getResolvedApplications()
            .subscribe(apps => {
                this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(apps));
            }, reason => {
                this.logger.handleError('[applications-overview.component][getResolvedApplications]', reason);
            });
    }

    /**
     * Tracking for ngFor to enable tracking of id field of Application
     * @param index
     * @param app
     * @returns {string}
     */
    trackAppsFn(index: number, app: Csar) {
        return app.id;
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }
}
