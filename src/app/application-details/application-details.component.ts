import {Component, OnInit, trigger, state, style, transition, animate} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ApplicationService} from "../shared/application.service";
import {Application} from "../shared/application.model";

@Component({
    selector: 'opentosca-application-details',
    templateUrl: 'src/app/application-details/application-details.component.html',
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

export class ApplicationDetailsComponent implements OnInit {

    app: Application;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            this.appService.getAppDescription(params['id']).then(app => this.app = app);
        });
    }
}
