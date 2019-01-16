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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';
import { ConfigurationService } from './configuration.service';
import { RouterModule } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { ButtonModule, ConfirmDialogModule, DialogModule, InputTextModule, TooltipModule } from 'primeng/primeng';
import { RepositoryConfigurationComponent } from './repository-configuration/repository-configuration.component';
import { TableModule } from 'primeng/table';
import { RepositoryValidatorDirective } from './repository-configuration/repository-validator.directive';
import { ControlOptionsDirective } from './repository-configuration/control-options.directive';
import { ForbiddenNameValidatorDirective } from './repository-configuration/forbidden-name.directive';
import { ForbiddenNameDisableDirective } from './repository-configuration/forbidden-name-disable.directive';
import { NgSpinKitModule } from 'ng-spin-kit';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PanelModule,
        InputTextModule,
        ButtonModule,
        TableModule,
        DialogModule,
        ConfirmDialogModule,
        NgSpinKitModule,
        TooltipModule,
        RouterModule,
        ConfigurationRoutingModule
    ],
    providers: [
        ConfigurationService
    ],
    declarations: [
        ConfigurationComponent,
        RepositoryConfigurationComponent,
        RepositoryValidatorDirective,
        ControlOptionsDirective,
        ForbiddenNameValidatorDirective,
        ForbiddenNameDisableDirective,
    ]
})
export class ConfigurationModule {
}
