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
        component: ApplicationsComponent
    },
    {
        path: 'applications/upload',
        component: ApplicationUploadComponent
    },
    {
        path: 'applications/:id',
        component: ApplicationDetailsComponent
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
