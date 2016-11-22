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
 *     Jasmin Guth - initial implementation
 */

import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { MarketplaceService } from '../shared/marketplace.service';
import { Application } from '../shared/model/application.model';
import { Category } from '../shared/model/category.model';
import { Subject } from 'rxjs/Subject';
import { AdministrationService } from '../administration/administration.service';

import * as _ from 'lodash';

@Component({
    selector: 'opentosca-marketplace',
    templateUrl: 'marketplace.component.html',
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

export class MarketplaceComponent implements OnInit {

    public categoriesAry = <Category[]>[];
    public filteredCategoriesAry = <Category[]>[];
    private apps = <Application[]>[];
    private searchTermStream = new Subject<string>();

    constructor(private marketService: MarketplaceService, private adminService: AdministrationService) {
    }

    ngOnInit(): void {
        this.getApps();
    }

    installInContainer(url: string): void {
        this.marketService.installAppInContainer(url, this.adminService.getContainerAPIURL())
            .then(response => {
                // console.log(response.headers, response.headers.get('Location'))
                console.log(response)
            })
            .catch(err => console.error(err));
    }

    // search(term: string): void {
    //     console.log('Entered search name: ' + term);
    //     this.searchTermStream.next(term);
    //     this.marketService.searchApps(term).subscribe(apps => {
    //         this.apps = apps;
    //         this.filteredCategoriesAry = this.generateCategoriesAry(apps);
    //     });
    // }

    getApps(): void {
        this.marketService.getAppsFromMarketPlace()
            .then(references => {
                for (let reference of references) {
                    this.marketService.getAppFromMarketPlace(reference, this.adminService.getWineryAPIURL())
                        .then(app => {
                            this.apps.push(app);
                            this.apps = _.orderBy(this.apps, ['displayName'], ['asc']);
                        });

                    // this.apps.push(app);
                    // this.categoriesAry = this.generateCategoriesAry(this.apps);
                    // this.filteredCategoriesAry = this.generateCategoriesAry(this.apps);
                }

            });
    }

    /*getApps(): void {
     this.appService.getApps().then(apps => {
     this.apps = apps;
     this.categoriesAry = this.generateCategoriesAry(apps);
     this.filteredCategoriesAry = this.generateCategoriesAry(apps);
     });
     }*/

    generateCategoriesAry(apps: Application[]): Category[] {
        let ary: Category[] = [];
        for (let app of apps) {
            for (let category of app.categories) {
                this.addToCategoriesAry(category, app, ary);
            }
        }
        return ary;
    }

    addToCategoriesAry(category: string, app: Application, categoriesAry: Category[]): void {
        let found = false;
        for (let i in categoriesAry) {
            if (categoriesAry[i].category === category) {
                categoriesAry[i].apps.push(app);
                found = true;
                break;
            }
        }
        if (!found) {
            categoriesAry.push({category: category, apps: [app]});
        }
    }
}
