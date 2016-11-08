import {Component, OnInit, trigger, state, style, transition, animate} from '@angular/core';
import {AdministrationService} from '../shared/administration.service';


@Component({
    selector: 'opentosca-administration',
    templateUrl: 'src/app/administration/administration.component.html',
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
export class AdministrationComponent implements OnInit {

    public containerAPI: string;
    public buildPlanPath: string;

    constructor(private adminService: AdministrationService) {
    }

    ngOnInit(): void {
        this.containerAPI = this.adminService.getContainerAPIURL();
        this.buildPlanPath = this.adminService.getBuildPlanPath();
    }


}
