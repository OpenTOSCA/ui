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
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { Observable } from 'rxjs';
import { ConfigurationActions } from '../configuration-actions';
import { ConfirmationService } from 'primeng/api';
import { RepositoryActions } from '../../repository/repository-actions.service';

export interface Item {
    name: string;
    url: string;
}

@Component({
    selector: 'opentosca-repository-configuration',
    templateUrl: './repository-configuration.component.html'
})
export class RepositoryConfigurationComponent implements OnInit {

    @select(['administration', 'repositoryItems']) repositoryItems: Observable<Array<Item>>;
    items: Item[] = [];

    displayDialog: boolean;
    isNewItem: boolean;
    newItem: Item;
    selectedItem: Item;
    cols: any[];

    constructor(private ngRedux: NgRedux<AppState>, private confirmationService: ConfirmationService) {
    }

    static cloneItem(item: Item): Item {
        const newItem = {} as Item;
        for (const prop in item) {
            newItem[prop] = item[prop];
        }
        return newItem;
    }

    ngOnInit() {
        this.cols = [
            { field: 'name', header: 'Name', width: '25%' },
            { field: 'url', header: 'URL' },
        ];
        this.repositoryItems.subscribe(items => {
            this.items = items;
        });
    }

    showDialogToAdd() {
        this.isNewItem = true;
        this.newItem = {} as Item;
        this.displayDialog = true;
    }

    save() {
        const items = [...this.items];
        if (this.isNewItem) {
            items.push(this.newItem);
        } else {
            items[this.items.indexOf(this.selectedItem)] = this.newItem;
        }
        this.ngRedux.dispatch(ConfigurationActions.updateRepositoryItems(items));
        this.newItem = null;
        this.displayDialog = false;
    }

    cancel() {
        this.isNewItem = false;
        this.newItem = null;
        this.selectedItem = null;
        this.displayDialog = false;
    }

    delete() {
        this.confirmationService.confirm({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            accept: () => {
                const index = this.items.indexOf(this.selectedItem);
                const items = this.items.filter((val, i) => i !== index);
                this.ngRedux.dispatch(ConfigurationActions.updateRepositoryItems(items));
                this.ngRedux.dispatch(RepositoryActions.setSelectedRepository(null));
                this.newItem = null;
                this.displayDialog = false;
            }
        });
    }

    onRowSelect(event) {
        this.isNewItem = false;
        this.newItem = RepositoryConfigurationComponent.cloneItem(event.data);
        this.displayDialog = true;
    }
}
