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
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { BreadcrumbActions } from '../core/component/breadcrumb/breadcrumb-actions';
import { AppState } from '../store/app-state.model';

@Component({
    selector: 'opentosca-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AboutComponent implements OnInit {

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push({label: 'About'});
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
    }

    constructor(private ngRedux: NgRedux<AppState>) {
    }
}

