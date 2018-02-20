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
 *     Michael Wurster - initial implementation
 *     Karoline Saatkamp - add deployment completion functionality
 */

import { Component, NgZone, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NgUploaderOptions, UploadedFile } from 'ngx-uploader';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementActions } from '../application-management-actions';
import { MarketplaceApplication } from '../../core/model/marketplace-application.model';
import { DeploymentCompletionService } from '../../core/service/deployment-completion.service';
import { RepositoryManagementService } from '../../core/service/repository-management.service';
import { Path } from '../../core/util/path';
import { GrowlActions } from '../../core/growl/growl-actions';
import { CsarUploadReference } from '../../core/model/new-api/csar-upload-request.model';
import { Observable } from 'rxjs/Rx';
import { observable } from 'rxjs/symbol/observable';


@Component({
    selector: 'opentosca-application-upload',
    templateUrl: './application-upload.component.html',
    styleUrls: ['./application-upload.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ApplicationUploadComponent implements OnInit {
    public deploymentInProgress = false;
    public deploymentDone = false; // unused ?!!
    public currentSpeed: string;
    public options: NgUploaderOptions;
    public linkToWineryResourceForCompletion: string;
    public appToComplete: MarketplaceApplication;
    public startCompletionProcess: boolean;
    public inputUploadEvents: EventEmitter<string>;
    public uploadingFile: UploadedFile;
    public selectedFile: any;
    public showModal = true;

    // temporary data derived from the user input for the url upload
    public tempData = {
        cur: new CsarUploadReference(null, null),
        validURL: false,
        validName: false
    };

    private zone: NgZone;
    private lastUpdate: number;

    constructor(
            private adminService: ConfigurationService,
            private appService: ApplicationManagementService,
            private deploymentService: DeploymentCompletionService,
            private repositoryManagementService: RepositoryManagementService,
            private ngRedux: NgRedux<AppState>,
            private router: Router,
            private http: Http,
            private logger: OpenToscaLoggerService) {
        this.inputUploadEvents = new EventEmitter<string>();
    }

    ngOnInit(): void {
        this.zone = new NgZone({enableLongStackTrace: false});
        const postURL = new Path(this.adminService.getContainerAPIURL())
            .append('csars')
            .toString();

        this.options = {
            url: postURL,
            customHeaders: {
                'Accept': 'application/json'
            },
            filterExtensions: true,
            allowedExtensions: ['csar'],
            calculateSpeed: true,
            previewUrl: true,
            autoUpload: false,
        };
    }

    closeModal(): void {
        this.showModal = false;
    }

    adaptRoute(): void {
        this.router.navigate(['../applications', {outlets: {modal: null}}]);
    }

    /**
     * Saves selected file to show it in template
     * @param event
     */
    onChange(event): void {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.selectedFile = files[0];
        }
    }

    /**
     * Starts upload of selected file to container
     */
    startUpload(): void {
        this.inputUploadEvents.emit('startUpload');
    }

    /**
     * Starts upload of selected url to container
     */
    startURLUpload(): void {
        const postURL = new Path(this.adminService.getContainerAPIURL())
                .append('csars')
                .toString();
        this.repositoryManagementService.installAppInContainer(this.tempData.cur, postURL)
        .then(response => {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'success',
                    summary: 'Upload Succeeded',
                    detail: 'New Application was successfully uploaded and deployed to container'
                }
            ));
            this.updateApplicationsInStore();
        })
        .catch(err => {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Application was not successfully uploaded and deployed. Server responded: ' + err
                }
            ));
        });
        this.closeModal();
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'info',
                summary: 'Deploying Container ' + this.tempData.cur.name,
                detail: 'Your container is uploaded and installed in the background.'
            }
        ));
        this.resetUploadStats();
    }

    /**
     * Save uploadingFile for access in template
     * @param uploadingFile
     */
    beforeUpload(uploadingFile: UploadedFile): void {
        this.uploadingFile = uploadingFile;
    }

    /**
     * Abort an upload in progress
     */
    abortUpload(): void {
        this.uploadingFile.xhr.abort();
        this.resetUploadStats();
    }

    /**
     * Callback for ngx-uploader to process progress and status of file upload
     * @param data
     */
    handleUpload(data: any): void {
        this.zone.run(() => {
            if (this.uploadingFile && this.uploadingFile.progress['percent'] < 100) {
                this.deploymentInProgress = false;
                this.deploymentDone = false;
            } else {
                this.deploymentInProgress = true;
            }
            if (this.uploadingFile && this.uploadingFile.status === 201) {
                this.deploymentDone = true;
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Upload Succeeded',
                        detail: 'New Application was successfully uploaded and deployed to container'
                    }
                ));
                this.updateApplicationsInStore();
                this.resetUploadStats();
                this.closeModal();
            }
            if (this.uploadingFile && this.uploadingFile.status === 406) {
                const location = JSON.parse(this.uploadingFile.response);
                this.linkToWineryResourceForCompletion = location ['Location']  as string;
                this.deploymentService.getAppFromCompletionHandlerWinery(this.linkToWineryResourceForCompletion,
                    data.originalName.substr(0, this.uploadingFile.originalName.lastIndexOf('.csar')))
                    .then(app => {
                        this.appToComplete = app;
                        this.startCompletionProcess = true;
                        this.resetUploadStats();
                    })
                    .catch(err => this.logger.handleError('[application-upload.component][getAppFromCompletionHandlerWinery]', err));
            }
            if (this.uploadingFile && this.uploadingFile.status === 500) {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application was not successfully uploaded and deployed. Server responded: ' + this.uploadingFile.statusText
                    }
                ));
                this.closeModal();
            }
            this.updateCurrentSpeed(data.progress.speedHumanized);
        });
    }

    /**
     * Reload applications from Container and update redux store
     */
    updateApplicationsInStore(): void {
        this.appService.getResolvedApplications()
            .subscribe(apps => {
                this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(apps));
            }, reason => {
                this.logger.handleError('[application-upload.component][updateApplicationsInStore]', reason);
            });
    }

    /**
     * Reset upload state variables
     */
    resetUploadStats(): void {
        this.deploymentInProgress = false;
        this.uploadingFile = null;
        this.selectedFile = null;
        this.tempData.cur.url = null;
        this.tempData.cur.name = null;
        this.tempData.validURL = false;
        this.tempData.validName = false;
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
        // we only update current speed every 0.5 seconds
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

    installInContainer(app: MarketplaceApplication): void {
        this.deploymentInProgress = true;
        this.appService.isAppDeployedInContainer(app.id).then(result => {
            if (!result) {
                const postURL = new Path(this.adminService.getContainerAPIURL())
                    .append('csars')
                    .toString();
                const tmpApp = new CsarUploadReference(app.csarURL, app.id)
                this.repositoryManagementService.installAppInContainer(tmpApp, postURL)
                    .then(response => {
                        this.appService.isAppDeployedInContainer(app.id)
                            .then(output => {
                                if (output) {
                                    this.ngRedux.dispatch(GrowlActions.addGrowl(
                                        {
                                            severity: 'success',
                                            summary: 'Upload Succeeded',
                                            detail: 'Application was successfully completed and deployed to container'
                                        }
                                    ));
                                    this.deploymentDone = true;
                                    this.updateApplicationsInStore();
                                    this.resetUploadStats();
                                    this.closeModal();
                                    this.logger.log('[deployment-completion.component][installed&deployedinContainer]',
                                        this.appToComplete.displayName);
                                } else {
                                    this.logger.log('[deployment-completion.component][installed&notdeployedinContainer]',
                                        this.appToComplete.displayName);
                                    this.ngRedux.dispatch(GrowlActions.addGrowl(
                                        {
                                            severity: 'error',
                                            summary: 'Error',
                                            detail: 'Application was not successfully uploaded and deployed.'
                                        }
                                    ));
                                }
                            });
                    })
                    .catch(err => {
                        console.log(err);
                        this.appService.isAppDeployedInContainer(app.id)
                            .then(output => {
                                if (output) {
                                    this.deploymentDone = true;
                                    this.updateApplicationsInStore();
                                    this.logger.log('[deployment-completion.component][notinstalled&deployedinContainer]',
                                        this.appToComplete.displayName);
                                } else {
                                    this.logger.log('[deployment-completion.component][notinstalled&notdeployedinContainer]',
                                        this.appToComplete.displayName);
                                }
                            });
                    });
            } else {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application is already deployed'
                    }
                ));
                this.updateApplicationsInStore();
                this.closeModal();
                this.resetUploadStats();
            }
        });
    }

    urlChange(url: string): void {
        this.tempData.cur.url = url;
    }

    nameChange(name: string): void {
        this.tempData.cur.name = name;
    }

    urlValidityChange(validity: boolean): void {
        this.tempData.validURL = validity;
    }

    nameValidityChange(validity: boolean): void {
        this.tempData.validName = validity;
    }

    /**
     * Validator function for the url
     *
     * @param url string of the enter value
     * @return returns a Observable of the validity from the url
     */
    urlValidator(url: string): Observable<boolean> {
        return new Observable<boolean>( observer => {
            this.http.head(url).subscribe(
                response => {
                    observer.next(response.ok);
                },
                error => {
                    observer.next(false);
                }
            );
        });
    }

    /**
     * Validator function for the name
     *
     * @param url string of the enter value
     * @return returns a Observable of the validity from the name
     */
    nameValidator(name: string): Observable<boolean> {
        // TODO do actual validation!
        return Observable.of(true);
    }
}
