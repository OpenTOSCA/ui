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
import { Component } from '@angular/core';
import { Message } from 'primeng/primeng';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from './store/app-state.model';
import * as _ from 'lodash';
import { GrowlActions } from './core/growl/growl-actions';

@Component({
    selector: 'opentosca-ui-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public messages: Array<Message> = [];
    @select(['growl', 'messages']) growls: Observable<Array<Message>>;

    public constructor(private ngRedux: NgRedux<AppState>) {
        // We need this to pass messages to global growl component
        this.growls.subscribe(messages => {
            console.log(this.messages, messages);
            this.messages = messages;
        });
    }

    growlsChange(messages: Array<Message>): void {
        this.ngRedux.dispatch(GrowlActions.updateGrowls(messages));
    }
}
