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
            },
            {
                path: ':id',
                component: ApplicationDetailComponent,
                resolve: {
                    csar: ApplicationDetailResolverService
                }
            },
            {
                path: ':id/instances/:instID',
                component: ApplicationInstanceDetailComponent,
                resolve: {
                    serviceTemplateInstance: ApplicationInstanceDetailResolverService
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
