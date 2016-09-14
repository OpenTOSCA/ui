import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {ApplicationService} from "../shared/application.service";
import {Application} from "../shared/application.model";
import {Category} from "../shared/category.model";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Component({
    selector: 'opentosca-marketplace',
    templateUrl: 'src/app/marketplace/marketplace.component.html'
})

export class MarketplaceComponent implements OnInit {

    apps: Application[];
    categoriesAry = <Category[]>[];
    filteredCategoriesAry = <Category[]>[];
    private searchTermStream = new Subject<string>();

    constructor(private appService: ApplicationService) {
    }


    ngOnInit(): void {
        this.getApps();
    }

    search(term: string): void {
        /*
         * first of all, we filter locally
         * 0. bin filtered array to template and keep data from server seperatelly
         * 1. fetch apps from server
         * 2. generate categories array
         * 3. enter search term
         *
         * 4. iterate all categories and remove all non-matching apps from arrays
         * 5. this.filteredCategoriesAry = new categories array
         *
         */
    }

    getApps(): void {
        this.appService.getApps().then(apps => {
            this.apps = apps;
            this.categoriesAry = this.generateCategoriesAry(apps);
            this.filteredCategoriesAry = this.generateCategoriesAry(apps);
        });
    }

    generateCategoriesAry(apps: Application[]): Category[] {
        let ary = [];
        for (let app of apps) {
            for (let category of app.categories) {
                this.addToCategoriesAry(category, app, ary);
            }
        }
        return ary;
    }

    addToCategoriesAry(category: string, app: Application, categoriesAry: Category[]): void {
        let found: boolean = false;
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


