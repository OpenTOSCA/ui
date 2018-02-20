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
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';

@Component({
    selector: 'opentosca-application-instance-detail',
    templateUrl: './application-instance-detail.component.html',
    styleUrls: ['./application-instance-detail.component.scss']
})
export class ApplicationInstanceDetailComponent implements OnInit {

    public instance: ApplicationInstance;

    constructor(private route: ActivatedRoute,
                private ngRedux: NgRedux<AppState>) {
    }

    /**
     * Initialize component
     */
    ngOnInit(): void {

        this.route.data
            .subscribe((data: { applicationInstanceDetails: ApplicationInstance }) => {
                    this.instance = data.applicationInstanceDetails;
                    console.log(data.applicationInstanceDetails);

                    const breadCrumbs = [];
                    breadCrumbs.push({label: 'Applications', routerLink: '/applications'});
                    breadCrumbs.push(
                        {
                            label: data.applicationInstanceDetails.appID,
                            routerLink: ['/applications', data.applicationInstanceDetails.appID]
                        });
                    breadCrumbs.push(
                        {
                            label: 'Instance: '
                            + data.applicationInstanceDetails.shortServiceTemplateInstanceID
                        }
                    );
                    this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
                },
                reason => console.log('WRONG'));
    }
}
