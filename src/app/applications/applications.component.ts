import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../shared/application.service";
import {Application} from "../shared/application.model";
@Component({
    selector: 'opentosca-applications',
    templateUrl: 'src/app/applications/applications.component.html'
})

export class ApplicationsComponent implements OnInit {

    apps: Array<Application>;


    constructor(private appService: ApplicationService) {
    }

    ngOnInit(): void {
        this.getApps();
    }

    getApps(): void {
        this.appService.getApps().then(apps => this.apps = this.sortAppArray(apps));
    }

    sortAppArray(apps: Array<Application>): Array<Application> {
        apps.sort((left: Application, right: Application): number => {
            if (left.name < right.name) {
                return -1;
            } else if (left.name > right.name) {
                return 1;
            } else {
                return 0;
            }
        });
        return apps;
    }
}
