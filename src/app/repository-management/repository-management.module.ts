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
import { CommonModule } from '@angular/common';
import { RepositoryManagementRoutingModule } from './repository-management-routing.module';
import { ConfigurationService } from '../configuration/configuration.service';
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
