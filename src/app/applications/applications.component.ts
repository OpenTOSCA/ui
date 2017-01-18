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
 */
import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';

import { NgRedux, select } from 'ng2-redux';
import { IAppState } from '../redux/store';
import { OpenTOSCAUiActions } from '../redux/actions';
import { ErrorHandler } from '../shared/helper/handleError';
import { Observable } from 'rxjs';

@Component({
    selector: 'opentosca-applications',
    templateUrl: 'applications.component.html',
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
export class ApplicationsComponent implements OnInit {

    @select(['container', 'applications']) apps: Observable<Array<Application>>;

    constructor(private appService: ApplicationService, private ngRedux: NgRedux<IAppState>) {
    }

    ngOnInit(): void {
        this.getAppReferences();
    }

    /**
     * Delegate app deletion to the ApplicationService
     * @param app
     */
    deleteFromContainer(app: Application): void {
        this.appService.deleteAppFromContainer(app.id + '.csar')
            .then(response => {
                console.log(response);
                this.ngRedux.dispatch(OpenTOSCAUiActions.removeContainerApplication(app));
            })
            .catch(err => ErrorHandler.handleError('[applications.component][deleteFromContainer]', err));
    }

    /**
     * Fetch application descriptions from container.
     * Fetch application references from container and app description of each reference.
     */
    getAppReferences(): void {
        this.appService.getApps().then(references => {
            for (let ref of references) {
                if (ref.title !== 'Self') {
                    this.appService.getAppDescription(ref.title)
                        .then(app => {
                            this.ngRedux.dispatch(OpenTOSCAUiActions.addContainerApplications([app]));
                        })
                        .catch(err => {
                            if (err.status === 404) {
                                // we found a csar that does not contain a data.json, so use default values
                                let app = new Application();
                                app.id = ref.title.split('.')[0];
                                app.csarName = ref.title;
                                app.displayName = ref.title.split('.')[0];
                                app.categories = ['others'];
                                app.iconUrl = '../../assets/img/Applications_Header_Icon.png';
                                this.ngRedux.dispatch(OpenTOSCAUiActions.addContainerApplications([app]));
                            }
                        });
                }
            }
        });
    }
}
