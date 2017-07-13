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
import { CommonModule } from '@angular/common';
import { RepositoryManagementRoutingModule } from './repository-management-routing.module';
import { ConfigurationService } from './../configuration/configuration.service';
import { RepositoryComponent } from './repository/repository.component';
import { RepositoryOverviewComponent } from './repository-overview/repository-overview.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { NgSpinKitModule } from 'ng-spin-kit';
import { TooltipModule } from 'primeng/primeng';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TooltipModule,
        NgSpinKitModule,
        RepositoryManagementRoutingModule,
        CoreModule
    ],
    declarations: [RepositoryComponent, RepositoryOverviewComponent],
    providers: [ConfigurationService]
})
export class RepositoryManagementModule {
}
