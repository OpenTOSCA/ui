import {Component, OnInit, trigger, state, style, transition, animate} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ApplicationService} from "../shared/application.service";
import {About} from "../shared/about.model";

@Component({
    selector: 'opentosca-about',
    templateUrl: 'src/app/about/about.component.html',
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

export class AboutComponent implements OnInit{

    public about: About;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {

    }

    setAbout(): void {
        this.about = new About();
        this.about.copyright = "Copyright (c) 2012-2016 University of Stuttgart\nAll rights reserved. This program and the accompanying materials are made available under the terms of the Apache License 2.0."
        this.about.notice = ""
    }
}
