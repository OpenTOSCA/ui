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
import { PlanQkPlatformLoginService } from "../../services/plan-qk-platform-login.service";

export interface Item {
    name: string;
    url: string;
}

@Component({
    selector: 'opentosca-repository-configuration',
    templateUrl: './repository-configuration.component.html',
    styleUrls: ['./repository-configuration.component.scss']
})
export class RepositoryConfigurationComponent implements OnInit {

    @select(['administration', 'repositoryItems']) repositoryItems: Observable<Array<Item>>;
    @select(['repository', 'selectedRepository']) selectedRepository$: Observable<Item>;

    readonly planQkPlatform = 'PlanQK Platform';
    readonly planQkPlatformUrl = 'https://platform.planqk.de/qc-catalog/tosca/servicetemplates/';
    readonly loginText = 'Log in to PlanQK';
    readonly logoutText = 'Log out of PlanQK';

    items: Item[] = [];
    selectedRepository: Item = null;

    displayDialog: boolean;
    isNewItem: boolean;
    newItem: Item;
    selectedItem: Item;
    cols: any[];
    planQkButtonText = this.loginText;

    constructor(private ngRedux: NgRedux<AppState>, private confirmationService: ConfirmationService, private planQKService: PlanQkPlatformLoginService) {
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
        this.selectedRepository$.subscribe(item => {
            this.selectedRepository = item;
        });
        this.planQKService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
            if (isLoggedIn) {
                this.isNewItem = false;
                this.selectedItem = {
                    url: this.planQkPlatformUrl,
                    name: this.planQkPlatform
                };
                if (!this.items.some(e => e.name === this.selectedItem.name)) {
                    this.newItem = this.selectedItem
                    this.isNewItem = true
                }
                this.planQkButtonText = this.logoutText;
                this.save();
            }

        })
    }

    showDialogToAdd() {
        this.isNewItem = true;
        this.newItem = {} as Item;
        this.displayDialog = true;
    }

    logInToPlanQK() {
        if (this.planQkButtonText === this.loginText) {
            this.planQKService.loginToPlanQkPlatform()
        } else {
            this.confirmationService.confirm({
                message: 'Do you want to log out from the PlanQK Platform?',
                header: 'Logout from PlanQK',
                acceptLabel: 'Logout',
                accept: () => {
                    this.planQKService.logoutFromPlanQkPlatform();
                    this.planQkButtonText = this.logoutText;
                    this.selectedItem = this.items.find(value => value.name === this.planQkPlatform);
                    this.acceptedDelete();
                }
            });
        }
    }

    save() {
        const items = [...this.items];
        let changedSelectedRepository = false;
        if (this.isNewItem) {
            items.push(this.newItem);
        }

        const changedRepositoryIndex = this.items.indexOf(this.selectedItem);
        items[changedRepositoryIndex] = this.newItem;
        if (
            this.selectedItem != null &&
            this.selectedRepository != null &&
            this.selectedItem.name !== this.selectedRepository.name &&
            this.selectedItem.url !== this.selectedRepository.url
        ) {
            // name and url of currently selected repository match the changed item
            changedSelectedRepository = true;
        }

        this.ngRedux.dispatch(ConfigurationActions.updateRepositoryItems(items));
        if (changedSelectedRepository) { // changed the selected repository => need to update it in store
            this.ngRedux.dispatch(RepositoryActions.setSelectedRepository(this.newItem));
        }
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
            accept: () => this.acceptedDelete()
        });
    }

    onRowSelect(event) {
        this.isNewItem = false;
        this.newItem = RepositoryConfigurationComponent.cloneItem(event.data);
        this.displayDialog = true;
    }

    private acceptedDelete() {
        const index = this.items.indexOf(this.selectedItem);
        const items = this.items.filter((val, i) => i !== index);
        this.ngRedux.dispatch(ConfigurationActions.updateRepositoryItems(items));
        this.ngRedux.dispatch(RepositoryActions.setSelectedRepository(null));
        this.newItem = null;
        this.displayDialog = false;
    }
}
