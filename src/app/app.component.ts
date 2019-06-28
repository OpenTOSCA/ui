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
import { MenuItem, Message } from 'primeng/primeng';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from './store/app-state.model';
import { GrowlActions } from './core/growl/growl-actions';
import { Observable } from 'rxjs';

@Component({
    selector: 'opentosca-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public topologyModelerData : any;

    public messages: Array<Message> = [];
    @select(['growl', 'messages']) growls: Observable<Array<Message>>;

    public menuItems: Array<MenuItem> = [
        {
            label: 'Applications',
            icon: 'fa fa-layer-group',
            routerLink: ['/applications']
        },
        {
            label: 'Repository',
            icon: 'fab fa-app-store',
            routerLink: ['/repository']
        },
        {
            label: 'Administration',
            icon: 'fa fa-cogs',
            routerLink: ['/administration']
        },
        {
            label: 'About',
            icon: 'fa fa-info-circle',
            routerLink: ['/about']
        }
    ];

    constructor(private ngRedux: NgRedux<AppState>) {
        // We need this to pass messages to global Growl component
        this.growls.subscribe(messages => {
            this.messages = messages;
        });

        this.topologyModelerData = {
            configuration: {
                isReadonly: true,
                endpointConfig: {
                    id: '',
                    ns: '',
                    repositoryURL: '',
                    uiURL: '',
                    compareTo: ''
                }
            },
            topologyTemplate: {
                nodeTemplates: [
                {
                    properties: 'Blah1',
                    id: '1',
                    type: 'Cool',
                    name: 'First Node',
                    minInstances: 1,
                    maxInstances: 2,
                    visuals: {
                        color: 'red',
                        typeId: '1',
                    },

                },
                {
                    properties: 'Blah2',
                    id: '2',
                    type: 'Cool',
                    name: 'Second Node',
                    minInstances: 1,
                    maxInstances: 2,
                    visuals: {
                        color: 'blue',
                        typeId: '2',
                    },

                },
                {
                    properties: 'Blah3',
                    id: '3',
                    type: 'Cool',
                    name: 'Third Node',
                    minInstances: 1,
                    maxInstances: 2,
                    visuals: {
                        color: '#000',
                        typeId: '3',
                    },
                }
            ],
            relationshipTemplates: [{
                sourceElement: {
                    ref: '1'
                },
                targetElement: {
                    ref: '2'
                },
                id: 'con_1',
                name: 'HostedOn',
                type: '{http://docs.oasis-open.org/tosca/ns/2011/12/ToscaBaseTypes}HostedOn'
            }]
        },


        visuals: [
            {
                color: 'red',
                typeId: '1',
            },
            {
                color: 'black',
                typeId: '1',
            },
            {
                color: 'yellow',
                typeId: '1',
            }
        ]
        }
    }

    public updateGrowls(messages: Array<Message>): void {
        this.ngRedux.dispatch(GrowlActions.updateGrowls(messages));
    }
}
