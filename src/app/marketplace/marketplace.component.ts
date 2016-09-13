import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {ApplicationService} from "../shared/application.service";
import {Application} from "../shared/application.model";
import {Subject, Observable} from "rxjs";

@Component({
    selector: 'opentosca-marketplace',
    templateUrl: 'src/app/marketplace/marketplace.component.html'
})

export class MarketplaceComponent implements OnInit {

    apps: Application[];
    categoriesAry = <{category: string, apps: Application[]}[]>[];

    constructor(private appService: ApplicationService) {
    }


    ngOnInit(): void {
        this.getApps();
    }

    search(term: string): {category: string, apps: Application[]}[] {
        //TODO
        return
    }

    getApps(): void {
        this.appService.getApps().then(apps => {
            this.apps = apps;
            for (let app of apps) {
                for (let category of app.categories) {
                    this.addToCategoriesAry(category, app);
                }
            }
        });
    }

    addToCategoriesAry(category: string, app: Application): void {
        let found: boolean = false;
        for (let i in this.categoriesAry) {
            if (this.categoriesAry[i].category === category) {
                this.categoriesAry[i].apps.push(app);
                found = true;
                break;
            }
        }
        if (!found) {
            this.categoriesAry.push({category: category, apps: [app]});
        }
    }
}
