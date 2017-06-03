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
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { ApplicationDetailResolverService } from './application-detail/application-detail-resolver.service';
import { ApplicationInstanceDetailResolverService } from './application-instance-detail/application-instance-detail-resolver.service';
import { ApplicationInstanceDetailComponent } from 'app/application-management/application-instance-detail/application-instance-detail.component'; // tslint:disable-line
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationComponent } from './application/application.component';
import { ApplicationOverviewComponent } from './application-overview/application-overview.component';

const routes: Routes = [
    {
        path: 'applications',
        component: ApplicationComponent,
        children: [
            {
                path: '',
                component: ApplicationOverviewComponent,
                pathMatch: 'full'
            },
            {
                path: ':id',
                component: ApplicationDetailComponent,
                resolve: {
                    applicationDetail: ApplicationDetailResolverService
                }
            },
            {
                path: ':id/instances/:instID',
                component: ApplicationInstanceDetailComponent,
                resolve: {
                    applicationInstanceDetails: ApplicationInstanceDetailResolverService
                }
            },
            {
                path: 'upload',
                component: ApplicationUploadComponent,
                outlet: 'modal'
            }
        ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationManagementRoutingModule { }
