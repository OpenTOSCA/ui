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
import { GrowlMessageBusService } from './core/service/growl-message-bus.service';

@Component({
  selector: 'opentosca-ui-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    private messages: Array<Message> = [];

    public constructor(private messageBus: GrowlMessageBusService) {
        // We need this to pass messages to global growl component
        this.messageBus.messages.subscribe(m => this.messages.push(m));
    }
}
