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
import { Component, Inject, OnInit } from '@angular/core';
import { MenuItem, Message } from 'primeng/primeng';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from './store/app-state.model';
import { GrowlActions } from './core/growl/growl-actions';
import { Observable } from 'rxjs';
import { ConfigurationActions } from './configuration/configuration-actions';
import { DOCUMENT } from '@angular/common';
import { rootReducer } from './store/store.reducer';
import * as storage from 'redux-storage';
import { applyMiddleware, createStore } from 'redux';
import createEngine from 'redux-storage-engine-localstorage';

@Component({
    selector: 'opentosca-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

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

    constructor(private ngRedux: NgRedux<AppState>, @Inject(DOCUMENT) private document: any) {
        // We need this to pass messages to global Growl component
        this.growls.subscribe(messages => {
            this.messages = messages;
        });
    }

    public updateGrowls(messages: Array<Message>): void {
        this.ngRedux.dispatch(GrowlActions.updateGrowls(messages));
    }

    ngOnInit(): void {
        this.ngRedux.dispatch(ConfigurationActions.updateContainerUrl(`http://${this.document.location.hostname}:1337`));
        this.ngRedux.dispatch(ConfigurationActions.updateRepositoryUrl(
            `http://${this.document.location.hostname}:8080/winery/servicetemplates/`
        ));

        // TODO
        // const engine = createEngine('opentosca');
        // const middleware = storage.createMiddleware(engine);
        // const createStoreWithMiddleware = applyMiddleware(middleware)(createStore);
        // const loader = storage.createLoader(engine);
        // loader(createStoreWithMiddleware(rootReducer))
        //     .then((newState) => console.log('Loaded state:', newState));
        // //     .catch(() => console.log('Failed to load previous state'));
    }
}
