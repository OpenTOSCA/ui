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

import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { ApplicationsComponent } from './applications/applications.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { AdministrationComponent } from './administration/administration.component';
import { ApplicationInstancesComponent } from './application-instances/application-instances.component';
import { ApplicationInstanceDetailsComponent } from './application-instance-details/application-instance-details.component';
import { ApplicationsOverviewComponent } from './applications-overview/applications-overview.component';
import { ApplicationDetailResolver } from './application-details/application-detail-resolver.service';
import { BreadcrumbEntry } from './shared/model/breadcrumb.model';


const appRoutes: Routes = [
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'administration',
        component: AdministrationComponent
    },
    {
        path: 'applications',
        component: ApplicationsComponent,
        children: [
            {
                path: '',
                component: ApplicationsOverviewComponent
            },
            {
                path: 'upload',
                component: ApplicationUploadComponent,
                outlet: 'modal'
            },
            {
                path: ':id',
                component: ApplicationDetailsComponent,
                resolve: {
                    applicationDetail: ApplicationDetailResolver
                }
            },
            {
                path: ':id/instances',
                component: ApplicationInstancesComponent
            },
            {
                path: ':id/instances/1',
                component: ApplicationInstanceDetailsComponent
            }
        ]
    },
    {
        path: 'repository',
        component: MarketplaceComponent
    },
    {
        path: 'repository/applications/:id',
        component: ApplicationDetailsComponent
    },
    {
        path: '',
        redirectTo: '/applications',
        pathMatch: 'full'
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
