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
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ModalDirective } from 'ngx-bootstrap';
import { Application } from 'app/core/model/application.model';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { BreadcrumbEntry } from '../../core/model/breadcrumb.model';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';
import { Csar } from '../../core/model/new-api/csar.model';
import { GrowlActions } from '../../core/growl/growl-actions';

@Component({
    selector: 'opentosca-ui-application-overview',
    templateUrl: './application-overview.component.html',
    styleUrls: ['./application-overview.component.scss']
})
export class ApplicationOverviewComponent implements OnInit {
    @select(['container', 'applications']) public readonly apps: Observable<Array<Csar>>;
    @ViewChild('childModal') public childModal: ModalDirective;

    public removingApp = false;
    public appToDelete: Application;
    public searchTerm: string;

    constructor(private appService: ApplicationManagementService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Applications', ''));
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
            .then(response => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Deletion Successfull',
                        detail: 'Application ' + app.id + ' was successfully deleted.'
                    }
                ));
                this.logger.log('[applications-overview.component][deleteFromContainer]',
                    'Application successfully deleted, received response: ' + JSON.stringify(response));
                this.ngRedux.dispatch(ApplicationManagementActions.removeContainerApplication(app));
                this.removingApp = false;
                this.hideDeleteConfirmationModal();
            })
            .catch(err => {
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
                this.logger.handleError('[applications-overview.component][deleteFromContainer]', err);
            });
    }

    reloadApplications(): void {
        this.getResolvedApplications();
    }

    hideDeleteConfirmationModal(): void {
        this.childModal.hide();
        this.appToDelete = null;
    }

    showDeleteConfirmationModal(appToDelete: Application): void {
        this.appToDelete = appToDelete;
        this.childModal.show();
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
    trackAppsFn(index: number, app: Application) {
        return app.id;
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm;
    }
}
