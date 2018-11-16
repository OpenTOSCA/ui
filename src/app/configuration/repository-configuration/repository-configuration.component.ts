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
import { ConfigurationService } from '../configuration.service';

export interface Item {
    name: string;
    url: string;
}

@Component({
    selector: 'opentosca-repository-configuration',
    templateUrl: './repository-configuration.component.html'
})
export class RepositoryConfigurationComponent implements OnInit {

    dialog = {
        name: '',
        url: ''
    };

    displayDialog: boolean;
    isNewItem: boolean;
    newItem: Item;
    selectedItem: Item;
    items: Item[];
    cols: any[];

    // public nameControl: FormControl = new FormControl();
    // public urlControl: FormControl = new FormControl();

    constructor(private configService: ConfigurationService) {
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
            { field: 'name', header: 'Name' },
            { field: 'url', header: 'URL' },
        ];
    }

    // validRepository(url: string): void {
    //     this.configService.isRepositoryAvailable(url)
    //         .subscribe(() => this.urlControl.set = true,
    //             () => this.repositoryUrlAvailable = false);
    // }
    // updateRepositoryUrl(newValue: string): void {
    //     this.configService.setRepositoryUrl(newValue);
    //     this.logger.log('[administration.component][updateRepositoryUrl] Updated repository URL to: ',
    //         this.configService.getRepositoryUrl());
    // }

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
        this.items = items;
        this.newItem = null;
        this.displayDialog = false;
    }

    cancel() {
        this.isNewItem = false;
        this.newItem = null;
        this.displayDialog = false
    }

    delete() {
        const index = this.items.indexOf(this.selectedItem);
        this.items = this.items.filter((val, i) => i !== index);
        this.newItem = null;
        this.displayDialog = false;
    }

    onRowSelect(event) {
        this.isNewItem = false;
        this.newItem = RepositoryConfigurationComponent.cloneItem(event.data);
        this.displayDialog = true;
    }
}
