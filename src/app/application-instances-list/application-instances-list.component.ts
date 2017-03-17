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
import { Component, OnInit, ViewChild, trigger, state, style, transition, animate, Input } from '@angular/core';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';
import { Logger } from '../shared/helper';
import { ModalDirective } from 'ng2-bootstrap';

import * as _ from 'lodash';

@Component({
    selector: 'opentosca-application-instances-list',
    templateUrl: 'application-instances-list.component.html',
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

export class ApplicationInstancesListComponent implements OnInit {
    public instancesList: Array<any>;

    @ViewChild('childModal') public childModal: ModalDirective;
    @Input() public app: Application;

    constructor(private appService: ApplicationService) {
    }

    /**
     * Initialize component by loading service instances of the app
     */
    ngOnInit(): void {
        this.appService.getServiceTemplateInstancesByAppID(this.app.id)
            .then(result => {
                this.appService.getProvisioningStateOfServiceTemplateInstances(result)
                    .then(results => {
                        let preparedResults = [];
                        for (let res of results) {
                            let selfServiceUrl = this.getObjectsByPropertyDeep(res, 'selfserviceApplicationUrl');
                            if (selfServiceUrl.length > 0) {
                                _.assign(res, selfServiceUrl[0]);
                            }
                            preparedResults.push(res);
                        }
                        this.instancesList = preparedResults;
                    })
                    .catch(reason => Logger.handleError(
                        '[application-instances-list.component][ngOnInit][getProvisioningStateofServiceTemplateInstance]',
                        reason));
            });
    }

    getObjectsByPropertyDeep(obj: any, property: string): Array<Object> {
        if (_.has(obj, property)) {
            return [obj];
        } else {
            return _.flatten(_.map(obj, (v) => {
                return typeof v == 'object' ? this.getObjectsByPropertyDeep(v, property) : [];
            }), true);
        }
    }
}
