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
import { RouterModule, Routes } from '@angular/router';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { ApplicationDetailResolverService } from './application-detail/application-detail-resolver.service';
import { ApplicationInstanceDetailResolverService } from './application-instance-detail/application-instance-detail-resolver.service';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationOverviewComponent } from './application-overview/application-overview.component';
import { ApplicationInstanceDetailComponent } from './application-instance-detail/application-instance-detail.component';

const routes: Routes = [
    {
        path: 'applications',
        component: ApplicationOverviewComponent,
        children: [
            {
                path: 'upload',
                component: ApplicationUploadComponent,
                outlet: 'modal'
            }
        ]
    },
    {
        path: 'applications/:id',
        component: ApplicationDetailComponent,
        resolve: {
            csar: ApplicationDetailResolverService
        }
    },
    {
        path: 'applications/:id/instances/:instanceId',
        component: ApplicationInstanceDetailComponent,
        resolve: {
            serviceTemplateInstance: ApplicationInstanceDetailResolverService
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ApplicationManagementRoutingModule {
}
