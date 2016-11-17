import {Component, trigger, state, style, transition, animate, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Input} from "@angular/core/src/metadata/directives";

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
                style({'opacity': 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
})

export class AboutComponent{

    constructor(private route: ActivatedRoute) {
    }
}
