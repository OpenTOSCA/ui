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
import { RepositoryRoutingModule } from './repository-routing.module';
import { ConfigurationService } from '../configuration/configuration.service';
import { RepositoryComponent } from './repository.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { NgSpinKitModule } from 'ng-spin-kit';
import { ButtonModule, CardModule, ScrollPanelModule, ToolbarModule, TooltipModule } from 'primeng/primeng';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TooltipModule,
        CardModule,
        ButtonModule,
        ScrollPanelModule,
        ToolbarModule,
        NgSpinKitModule,
        CoreModule,
        RepositoryRoutingModule
    ],
    declarations: [RepositoryComponent],
    providers: [ConfigurationService]
})
export class RepositoryModule {
}
