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
import { Component, OnInit } from '@angular/core';
import { ApplicationInstance } from '../../core/model/application-instance.model';
import { ActivatedRoute } from '@angular/router';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ServiceTemplateInstance } from '../../core/model/new-api/service-template-instance.model';
import { Application } from 'app/core/model/application.model';
import { ApplicationManagementActions } from '../application-management-actions';
import { Observable } from 'rxjs/Rx';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'opentosca-application-instance-detail',
    templateUrl: './application-instance-detail.component.html',
    styleUrls: ['./application-instance-detail.component.scss']
})
export class ApplicationInstanceDetailComponent implements OnInit {

    @select(['container', 'currentInstance']) instance: Observable<ServiceTemplateInstance>;

    constructor(private route: ActivatedRoute,
                private ngRedux: NgRedux<AppState>) {
    }

    /**
     * Initialize component
     */
    ngOnInit(): void {
        this.route.data
            .subscribe((data: { serviceTemplateInstance: ServiceTemplateInstance }) => {
                    this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationInstance(data.serviceTemplateInstance));

                    const breadCrumbs = [];
                    breadCrumbs.push({label: 'Applications', routerLink: '/applications'});
                    breadCrumbs.push(
                        {
                            label: data.serviceTemplateInstance.csar_id,
                            routerLink: ['/applications', data.serviceTemplateInstance.csar_id]
                        });
                    breadCrumbs.push(
                        {
                            label: 'Instance: '
                            + data.serviceTemplateInstance.id
                        }
                    );
                    this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
                },
                reason => console.log('WRONG'));
    }
}
