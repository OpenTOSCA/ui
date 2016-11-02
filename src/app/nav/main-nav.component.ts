/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Component, trigger, state, style, transition, animate, ViewContainerRef} from "@angular/core";
@Component({
    selector: 'opentosca-ui',
    templateUrl: 'src/app/nav/main-nav.component.html',
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

export class MainNavComponent {
    //hack for ng2-bootstrap MODALS
    private viewContainerRef: ViewContainerRef;

    public constructor(viewContainerRef:ViewContainerRef) {
        // You need this small hack in order to catch application root view container ref
        this.viewContainerRef = viewContainerRef;
    }
}