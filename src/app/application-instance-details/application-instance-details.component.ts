/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */

import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'opentosca-application-instance-details',
    templateUrl: 'application-instance-details.component.html',
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

export class ApplicationInstanceDetailsComponent implements OnInit {

    constructor(private route: ActivatedRoute) {
    }

    /**
     * Initialize component
     */
    ngOnInit(): void {
        this.route.data
            .subscribe((data: {applicationInstanceDetails: any}) => {
                console.log(data.applicationInstanceDetails);
            },
            reason => console.log('WRONG'));
    }


}
