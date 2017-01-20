/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *     Karoline Saatkamp - initial implementation
 */
import { Component, OnInit, ViewChild, trigger, state, style, transition, animate } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';
import { ModalDirective } from 'ng2-bootstrap';
import { ResourceReference } from '../shared/model/resource-reference.model';

@Component({
    selector: 'opentosca-application-instances',
    templateUrl: 'application-instances.component.html',
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

export class ApplicationInstancesComponent implements OnInit {
    public app: Application;
    public instancesList: Array<ResourceReference>;

    @ViewChild('childModal') public childModal: ModalDirective;

    constructor(private route: ActivatedRoute,
                private appService: ApplicationService) {
    }

    /**
     * Initialize component by loading service instances of the csarID given in route params
     */
    ngOnInit(): void {

        this.route.params
            .subscribe(params => {
                this.appService.getAppDescription(params['id'])
                    .then(app => this.app = app);
                this.appService.getServiceTemplateInstancesByCsarName(params['id'])
                    .then(result => this.instancesList = result);
            });
    }
}
