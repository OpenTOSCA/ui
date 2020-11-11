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
import { SituationComponent } from './situation.component';
import { RouterModule } from '@angular/router';
import { NgSpinKitModule } from 'ng-spin-kit';
import {
    ButtonModule, CardModule, CheckboxModule, ConfirmDialogModule, DialogModule,
    DropdownModule, ScrollPanelModule, ToolbarModule, FieldsetModule,
    TooltipModule, MultiSelect, MultiSelectModule, ToggleButtonModule, InputTextModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [
        CommonModule,
        CheckboxModule,
        FormsModule,
        RouterModule,
        TooltipModule,
        TableModule,
        FieldsetModule,
        CardModule,
        ButtonModule,
        ScrollPanelModule,
        ToolbarModule,
        DropdownModule,
        DialogModule,
        NgSpinKitModule,
        ConfirmDialogModule,
        MultiSelectModule,
        ToggleButtonModule,
        InputTextModule
    ],
    declarations: [SituationComponent],
})
export class SituationModule {
}


