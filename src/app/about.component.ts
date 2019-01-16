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
import { Component, OnInit } from '@angular/core';
import { BreadcrumbActions } from './core/component/breadcrumb/breadcrumb-actions';
import { AppState } from './store/app-state.model';
import { NgRedux } from '@angular-redux/store';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'opentosca-about',
    templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {

    private items: MenuItem[];

    constructor(private ngRedux: NgRedux<AppState>) {
    }

    ngOnInit(): void {
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
            { label: 'About', routerLink: ['/about'] }
        ]));
    }
}
