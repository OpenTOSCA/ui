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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { LoggerService } from '../../core/service/logger.service';
import { ApplicationInstancesManagementService } from '../../core/service/application-instances-management.service';
import { AppState } from '../../store/app-state.model';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';
import { ApplicationManagementActions } from '../application-management-actions';
import { Csar } from '../../core/model/csar.model';
import { Plan } from '../../core/model/plan.model';
import { Observable } from 'rxjs';
import { GrowlActions } from '../../core/growl/growl-actions';

@Component({
    selector: 'opentosca-application-detail',
    templateUrl: './application-detail.component.html',
    styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {

    @select(['container', 'application', 'csar']) csar: Observable<Csar>;
    @select(['container', 'application', 'buildPlan']) buildPlan: Observable<Plan>;

    // dialogVisible: boolean = false;

    constructor(private route: ActivatedRoute, private router: Router, private ngRedux: NgRedux<AppState>,
                private applicationService: ApplicationManagementService, private instanceService: ApplicationInstancesManagementService,
                private logger: LoggerService) {
    }

    ngOnInit(): void {
        this.route.data.subscribe((data: { csar: Csar }) => {
            // Prepare breadcrumb
            this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
                { label: 'Applications', routerLink: 'applications' },
                { label: data.csar.id, routerLink: ['applications', data.csar.id] }
            ]));

            this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationCsar(data.csar));


            // this.appService.getBuildPlan(data.csar.id).subscribe(buildPlan => {
            //     this.ngRedux.dispatch(ApplicationManagementActions.updateBuildPlan(buildPlan));
            // });
            // this.appService.getTerminationPlan(data.csar.id).subscribe(terminationPlan => {
            //     this.ngRedux.dispatch(ApplicationManagementActions.updateTerminationPlan(terminationPlan));
            // });
            // // Load also application instances for list
            // this.updateAppInstancesList(data.csar);


        }, error => {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'warn',
                    summary: 'Loading of Data failed',
                    detail: `'Loading of data for the selected application failed.
                     Please try to load it again. Server returned: ${error.message}`
                }
            ));
            this.router.navigate(['/applications']);
        });
    }

    ngOnDestroy(): void {
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationInstances());
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplicationCsar());
    }


    // /**
    //  * Checks if given param should be shown in the start privisioning dialog
    //  * @param name
    //  * @returns {boolean}
    //  */
    // public showParam(name: string): boolean {
    //     return (!(name === 'CorrelationID' ||
    //         name === 'csarID' ||
    //         name === 'serviceTemplateID' ||
    //         name === 'containerApiAddress' ||
    //         name === 'instanceDataAPIUrl' ||
    //         name === 'planCallbackAddress_invoker' ||
    //         name === 'csarEntrypoint'));
    // }
    //
    //
    //
    // emitTerminationPlan(terminationEvent: string): void {
    //     const terminationPlan = Object.assign({}, this.ngRedux.getState().container.currentTerminationPlan);
    //     terminationPlan._links['self'].href = _.replace(terminationPlan._links['self'].href, ':id', terminationEvent);
    //     console.log(terminationPlan);
    //     this.appService.triggerTerminationPlan(terminationPlan)
    //         .subscribe(result => {
    //             // TODO Location header is filled with correct plan instance url but is not accessible in a http 201 response
    //             this.logger.log('[application-detail.component][emitTerminationPlan]', result);
    //             this.ngRedux.dispatch(GrowlActions.addGrowl(
    //                 {
    //                     severity: 'info',
    //                     summary: 'Termination started',
    //                     detail: 'The termination plan has been started.'
    //                 }
    //             ));
    //         });
    // }
    //
    // triggerUpdateAppInstancesList(): void {
    //     this.updateAppInstancesList(this.ngRedux.getState().container.currentApp);
    // }
    //
    // updateAppInstancesList(app: Csar): void {
    //     this.appInstancesService.getServiceTemplateInstancesOfCsar(app)
    //         .subscribe(result => {
    //             this.ngRedux.dispatch(ApplicationManagementActions.updateApplicationInstances(result));
    //         });
    // }
}
