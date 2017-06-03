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
import { Component, OnInit } from '@angular/core';
import { BreadcrumbEntry } from '../core/model/breadcrumb.model';
import { NgRedux } from '@angular-redux/store';
import { BreadcrumbActions } from '../core/component/breadcrumb/breadcrumb-actions';
import { AppState } from '../store/app-state.model';

@Component({
  selector: 'opentosca-ui-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})

export class AboutComponent implements OnInit {

    ngOnInit(): void {
        const breadCrumbs = [];
        breadCrumbs.push(new BreadcrumbEntry('About', ''));
        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb(breadCrumbs));
    }

    constructor(private ngRedux: NgRedux<AppState>) {
    }
}

