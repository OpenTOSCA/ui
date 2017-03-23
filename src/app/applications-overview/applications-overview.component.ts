/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
import { Component, OnInit, trigger, state, style, transition, animate, ViewChild } from '@angular/core';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';

import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../redux/store';
import { OpenTOSCAUiActions } from '../redux/actions';
import { Logger } from '../shared/helper';
import { Observable } from 'rxjs';
import { ModalDirective } from 'ng2-bootstrap';
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { GrowlMessageBusService } from '../shared/growl-message-bus.service';

@Component({
    selector: 'opentosca-applications-overview',
    templateUrl: 'applications-overview.component.html',
    animations: [
        trigger('fadeInOut', [
            state('in', style({'opacity': 1})),
            transition('void => *', [
                style({'opacity': 0}),
                animate('500ms ease-out')
            ]),
            transition('* => void', [
                style({'opacity': 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
})
export class ApplicationsOverviewComponent implements OnInit {
    @select(['container', 'applications']) apps: Observable<Array<Application>>;
    @ViewChild('childModal') public childModal: ModalDirective;

    public removingApp = false;
    public appToDelete: Application;

    constructor(private appService: ApplicationService,
                private ngRedux: NgRedux<AppState>,
                private messageBus: GrowlMessageBusService) {
    }

    ngOnInit(): void {
        let breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('Applications', ''));
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateBreadcrumb(breadCrumbs));
        this.getAppReferences();
    }

    /**
     * Delegate app deletion to the ApplicationService
     * @param app
     */
    deleteFromContainer(app: Application): void {
        this.removingApp = true;
        Logger.log('[applications-overview.component][deleteFromContainer]', 'Trying to delete the following App: ' + app.id);
        this.appService.deleteAppFromContainer(app.id)
            .then(response => {
                this.messageBus.emit({
                    severity: 'success',
                    summary: 'Deletion Successfull',
                    detail: 'Application ' + app.id + ' was successfully deleted.'
                });
                Logger.log('[applications-overview.component][deleteFromContainer]', 'Application successfully deleted, received response: ' + JSON.stringify(response));
                this.ngRedux.dispatch(OpenTOSCAUiActions.removeContainerApplication(app));
                this.removingApp = false;
                this.hideDeleteConfirmationModal();
            })
            .catch(err => {
                this.removingApp = false;
                this.hideDeleteConfirmationModal();
                this.messageBus.emit(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application ' + app.id +
                        ' was not successfully deleted. Server responded: ' + JSON.stringify(err)
                    }
                );
                Logger.handleError('[applications-overview.component][deleteFromContainer]', err);
            });
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
     * Fetch application descriptions from container.
     * Fetch application references from container and app description of each reference.
     */
    getAppReferences(): void {
        this.appService.getApps().then(references => {
            let appPromises = [] as Array<Promise<Application>>;
            for (let ref of references) {
                if (ref.title !== 'Self') {
                    appPromises.push(this.appService.getAppDescription(ref.title));
                }
            }
            Promise.all(appPromises)
                .then(apps => {
                    this.ngRedux.dispatch(OpenTOSCAUiActions.addContainerApplications(apps));
                })
                .catch(reason => {
                    Logger.handleError('[applications-overview.component][getAppReferences]', reason);
                });
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
}
