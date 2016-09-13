import {Component} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ApplicationService} from "../shared/application.service";
import {Application} from "../shared/application.model";

@Component({
    selector: 'opentosca-application-details',
    templateUrl: 'src/app/application-details/application-details.component.html'
})

export class ApplicationDetailsComponent {

    app: Application;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            this.appService.getApp(+params['id']).then(app => this.app = app);
        });
    }
}
