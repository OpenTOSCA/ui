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
import { Component, OnInit, NgZone, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AdministrationService } from '../administration/administration.service';
import { NgUploaderOptions } from 'ngx-uploader';
import { OpenTOSCAUiActions } from '../redux/actions';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../redux/store';
import { ApplicationService } from '../shared/application.service';
import { Application } from '../shared/model/application.model';
import { OpenToscaLogger } from '../shared/helper';
import { ModalDirective } from 'ng2-bootstrap';
import { Router } from '@angular/router';
import { GrowlMessageBusService } from '../shared/growl-message-bus.service';

@Component({
    selector: 'opentosca-application-upload',
    templateUrl: 'application-upload.component.html',
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

export class ApplicationUploadComponent implements OnInit, AfterViewInit {
    public deploymentInProgress = false;
    public deploymentDone = false;
    public max = 100;
    public dynamic = 0;
    public currentSpeed: string;
    public failureMessage: string;

    private zone: NgZone;
    private lastUpdate: number;
    private uploadFile: any;
    private options: NgUploaderOptions;

    @ViewChild('uploadModal') public uploadModal: ModalDirective;

    ngOnInit(): void {

        this.zone = new NgZone({enableLongStackTrace: false});
        this.options = {
            url: this.adminService.getContainerAPIURL() + '/CSARs',
            customHeaders: {
                'Accept': 'application/json'
            },
            // filterExtensions: true,
            // allowedExtensions: ['csar'],
            calculateSpeed: true
        };
    }

    ngAfterViewInit(): void {
        this.uploadModal.show();
    }

    closeModal(): void {
        this.uploadModal.hide();
    }

    adaptRoute(): void {
        this.router.navigate(['../applications', {outlets: {modal: null}}]);
    }

    constructor(private adminService: AdministrationService,
                private appService: ApplicationService,
                private messageBus: GrowlMessageBusService,
                private ngRedux: NgRedux<AppState>,
                private router: Router,
                private logger: OpenToscaLogger) {
    }

    /**
     * Callback for ng2-uploader to process progress and status of file upload
     * @param data
     */
    handleUpload(data: any): void {
        this.zone.run(() => {
            this.uploadFile = data;
            this.dynamic = data.progress.percent;
            if (this.dynamic < 100) {
                this.deploymentInProgress = false;
                this.deploymentDone = false;
            } else {
                this.deploymentInProgress = true;
            }
            if (data.status === 201) {
                this.deploymentDone = true;
                this.messageBus.emit(
                    {
                        severity: 'success',
                        summary: 'Upload Succeeded',
                        detail: 'New Application was successfully uploaded and deployed to container'
                    }
                );
                this.updateApplicationsInStore();
                this.resetUploadStats();
                this.closeModal();
            }
            if (data.status === 500) {
                this.failureMessage = data.statusText;
                this.messageBus.emit(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application was not successfully uploaded and deployed. Server responded: ' + data.statusText
                    }
                );
                this.closeModal();
            }
            this.updateCurrentSpeed(data.progress.speedHumanized);
        });
    }

    updateApplicationsInStore(): void {
        this.appService.getApps().then(references => {
            let appPromises = [] as Array<Promise<Application>>;
            for (let ref of references) {
                if (ref.title !== 'Self') {
                    appPromises.push(this.appService.getAppDescription(ref.title).toPromise());
                }
            }
            Promise.all(appPromises)
                .then(apps => {
                    this.ngRedux.dispatch(OpenTOSCAUiActions.addContainerApplications(apps));
                })
                .catch(reason => {
                    this.logger.handleError('[application-upload.component][updateApplicationsInStore]', reason);
                });
        });
    }

    /**
     * Reset upload state variables
     */
    resetUploadStats(): void {
        this.deploymentInProgress = false;
        this.dynamic = 0;
    }

    /**
     * Trigger update of variable to show current upload speed
     * @param speed
     */
    updateCurrentSpeed(speed: string): void {
        if (this.lastUpdate === undefined) {
            this.lastUpdate = Date.now();
            this.setCurrentSpeed(speed);
        }
        if ((Date.now() - this.lastUpdate) > 500) {
            this.setCurrentSpeed(speed);
            this.lastUpdate = Date.now();
        }
    }

    /**
     * Update variable to show current upload speed
     * @param speed
     */
    setCurrentSpeed(speed: string): void {
        if (speed) {
            this.currentSpeed = speed;
        }
    }

}
