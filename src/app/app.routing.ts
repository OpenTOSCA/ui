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
 */

import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { AdministrationComponent } from './administration/administration.component';
import { ApplicationInstanceDetailsComponent } from './application-instance-details/application-instance-details.component';
import { ApplicationsOverviewComponent } from './applications-overview/applications-overview.component';
import { ApplicationDetailsResolver } from './application-details/application-details-resolver.service';
import { MarketplacesComponent } from './marketplace/marketplaces.component';
import { MarketplaceOverviewComponent } from './marketplace-overview/marketplace-overview.component';
import { ApplicationInstanceDetailsResolver } from './application-instance-details/application-instance-details-resolver.service';

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
                component: ApplicationsOverviewComponent,
                pathMatch: 'full'
            },
            {
                path: ':id',
                component: ApplicationDetailsComponent,
                resolve: {
                    applicationDetail: ApplicationDetailsResolver
                }
            },
            {
                path: ':id/instances/:instID',
                component: ApplicationInstanceDetailsComponent,
                resolve: {
                    applicationInstanceDetails: ApplicationInstanceDetailsResolver
                }
            },
            {
                path: 'upload',
                component: ApplicationUploadComponent,
                outlet: 'modal'
            }
        ]
    },
    {
        path: 'repositories',
        component: MarketplacesComponent,
        children: [
            {
                path: '',
                component: MarketplaceOverviewComponent
            }
        ]
    },
    {
        path: '',
        redirectTo: '/applications',
        pathMatch: 'full'
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {useHash: true});
