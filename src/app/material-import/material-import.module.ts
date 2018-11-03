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
import {
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule, MatInputModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule
} from '@angular/material';

@NgModule({
    imports: [
        MatBadgeModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatDialogModule,
        MatTabsModule,
        MatInputModule
    ],
    exports: [
        MatButtonModule,
        MatBadgeModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatDialogModule,
        MatTabsModule,
        MatInputModule
    ],
    declarations: []
})
export class MaterialImportModule {
}
