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
import { Component } from '@angular/core';
import { select } from '@angular-redux/store';
import { Csar } from '../../core/model/csar.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'opentosca-application',
    templateUrl: './application.component.html',
    styleUrls: ['./application.component.scss']
})
export class ApplicationComponent {
    @select(['container', 'currentApp']) app: Observable<Csar>;
    constructor() {
    }
}
