/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
import { Component, trigger, state, style, transition, animate, ViewContainerRef } from '@angular/core';
import { GrowlMessageBusService } from './shared/growl-message-bus.service';
import { Message } from 'primeng/components/common/api';

@Component({
    selector: 'opentosca-ui',
    templateUrl: 'app.component.html',
    animations: [
        trigger('fadeInOut', [
            state('in', style({'opacity': 1})),
            transition('void => *', [
                style({'opacity': 0}),
                animate('500ms ease-out')
            ]),
            transition('* => void', [
                style({'opacity': 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
})

export class AppComponent {

    // hack for ng2-bootstrap MODALS
    private viewContainerRef: ViewContainerRef;
    private messages: Array<Message> = [];

    public constructor(viewContainerRef: ViewContainerRef,
                       private messageBus: GrowlMessageBusService) {
        // You need this small hack in order to catch application root view container ref
        this.viewContainerRef = viewContainerRef;
        // We need this to pass messages to global growl component
        this.messageBus.messages.subscribe(m => this.messages.push(m));
    }

}
