import {Component, Output, EventEmitter, OnInit, trigger, state, style, transition, animate} from '@angular/core';
import {ApplicationService} from "../shared/application.service";
import {Application} from "../shared/application.model";
import {Category} from "../shared/category.model";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Component({
    selector: 'opentosca-marketplace',
    templateUrl: 'src/app/marketplace/marketplace.component.html',
    animations: [
        trigger('fadeInOut', [
            state('in', style({'opacity': 1})),
            transition('void => *', [
                style({'opacity': 0}),
                animate('500ms ease-out')
            ]),
            transition('* => void', [
                style({'opacity' : 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
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
        console.log('Entered search name: ' + term);
        this.searchTermStream.next(term);
        this.appService.searchApps(term).subscribe(apps => {
            this.apps = apps;
            this.filteredCategoriesAry = this.generateCategoriesAry(apps);
        });
    }

    getApps(): void {
        this.appService.getApps().then(apps => {
            this.apps = apps;
            this.categoriesAry = this.generateCategoriesAry(apps);
            this.filteredCategoriesAry = this.generateCategoriesAry(apps);
        });
    }

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


