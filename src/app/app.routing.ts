import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ApplicationsComponent} from "./applications/applications.component";
import {MarketplaceComponent} from "./marketplace/marketplace.component";
import {ApplicationDetailsComponent} from "./application-details/application-details.component";
import {ApplicationUploadComponent} from "./application-upload/application-upload.component";


const appRoutes: Routes = [
    {
        path: 'applications',
        component: ApplicationsComponent
    },
    {
        path: 'applications/upload',
        component: ApplicationUploadComponent
    },
    {
        path: 'marketplace',
        component: MarketplaceComponent
    },
    {
        path: 'marketplace/applications/:id',
        component: ApplicationDetailsComponent
    },
    {
        path: '',
        redirectTo: '/applications',
        pathMatch: 'full'
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
