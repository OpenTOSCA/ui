/*
 * Copyright (c) 2018 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */

import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput } from 'ngx-uploader';
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
import { CsarUploadReference } from '../../core/model/csar-upload-request.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Todo Fix ngx-uploader

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
    public options: UploaderOptions;
    public linkToWineryResourceForCompletion: string;
    public appToComplete: MarketplaceApplication;
    public startCompletionProcess: boolean;
    public uploadInput: EventEmitter<UploadInput> = new EventEmitter<UploadInput>();
    public uploadingFile: UploadFile;
    public selectedFile: any;
    public showModal = true;

    // temporary data derived from the user input for the url upload
    public tempData = {
        cur: new CsarUploadReference(null, null),
        validURL: false,
        validName: false
    };

    private lastUpdate: number;

    constructor(
        private adminService: ConfigurationService,
        private appService: ApplicationManagementService,
        private deploymentService: DeploymentCompletionService,
        private repositoryManagementService: RepositoryManagementService,
        private ngRedux: NgRedux<AppState>,
        private router: Router,
        private http: HttpClient,
        private logger: OpenToscaLoggerService) {

    }

    ngOnInit(): void {
        this.options = {
            concurrency: 1,
        };
    }

    closeModal(): void {
        this.showModal = false;
    }

    adaptRoute(): void {
        this.router.navigate(['../applications', { outlets: { modal: null } }]);
    }

    /**
     * Starts upload of selected file to container
     */
    startUpload(): void {
        const postURL = new Path(this.adminService.getContainerUrl())
            .append('csars')
            .toString();
        this.uploadInput.emit({
            type: 'uploadFile',
            url: postURL,
            method: 'POST',
            file: this.uploadingFile
        });
    }

    /**
     * Starts upload of selected url to container
     */
    startURLUpload(): void {
        const postURL = new Path(this.adminService.getContainerUrl())
            .append('csars')
            .toString();
        this.repositoryManagementService.installAppInContainer(this.tempData.cur, postURL)
            .toPromise()
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
     * Abort an upload in progress
     */
    abortUpload(): void {
        this.uploadInput.emit({ type: 'cancelAll' });
        this.resetUploadStats();
    }

    // Todo Implement proper handling
    onUploadOutput(output: UploadOutput): void {
        console.log('Invoking onUploadOutout handle', output);
        switch (output.type) {
            case 'rejected':
                console.log('You selected a file with wrong type');
                break;
            /*case 'allAddedToQueue':
                // uncomment this if you want to auto upload files when added
                // const event: UploadInput = {
                //   type: 'uploadAll',
                //   url: '/upload',
                //   method: 'POST',
                //   data: { foo: 'bar' }
                // };
                // this.uploadInput.emit(event);
                break;*/
            case 'addedToQueue':
                console.log('addedToQueue');
                if (typeof output.file !== 'undefined') {
                    this.uploadingFile = output.file;
                }
                break;
            case 'uploading':
                if (typeof output.file !== 'undefined') {
                    // update current data in files array for uploading file
                    this.uploadingFile = output.file;
                    this.deploymentInProgress = false;
                    this.deploymentDone = false;
                }
                break;
            case 'removed':
                // remove file from array when removed
                this.uploadingFile = null;
                break;
            /*case 'dragOver':
                this.dragOver = true;
                break;
            case 'dragOut':
            case 'drop':
                this.dragOver = false;
                break;*/
            case 'done':
                // The file is uploaded
                this.deploymentInProgress = true;
                if (this.uploadingFile && this.uploadingFile.responseStatus === 201) {
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
                break;
        }
    }

    // /**
    //  * Callback for ngx-uploader to process progress and status of file upload
    //  * @param data
    //  */
    // handleUpload(data: any): void {
    //     this.zone.run(() => {
    //         if (this.uploadingFile && this.uploadingFile.progress.data.percentage < 100) {
    //             this.deploymentInProgress = false;
    //             this.deploymentDone = false;
    //         } else {
    //             this.deploymentInProgress = true;
    //         }
    //         if (this.uploadingFile && this.uploadingFile.responseStatus === 201) {
    //             this.deploymentDone = true;
    //             this.ngRedux.dispatch(GrowlActions.addGrowl(
    //                 {
    //                     severity: 'success',
    //                     summary: 'Upload Succeeded',
    //                     detail: 'New Application was successfully uploaded and deployed to container'
    //                 }
    //             ));
    //             this.updateApplicationsInStore();
    //             this.resetUploadStats();
    //             this.closeModal();
    //         }
    //         if (this.uploadingFile && this.uploadingFile.responseStatus === 406) {
    //             const location = JSON.parse(this.uploadingFile.response);
    //             this.linkToWineryResourceForCompletion = location ['Location']  as string;
    //             this.deploymentService.getAppFromCompletionHandlerWinery(this.linkToWineryResourceForCompletion,
    //                 data.originalName.substr(0, this.uploadingFile.nativeFile.name.lastIndexOf('.csar')))
    //                 .then(app => {
    //                     this.appToComplete = app;
    //                     this.startCompletionProcess = true;
    //                     this.resetUploadStats();
    //                 })
    //                 .catch(err => this.logger.handleError('[application-upload.component][getAppFromCompletionHandlerWinery]', err));
    //         }
    //         if (this.uploadingFile && this.uploadingFile.responseStatus === 500) {
    //             this.ngRedux.dispatch(GrowlActions.addGrowl(
    //                 {
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Application was not successfully uploaded and deployed. Server responded: ' + this.uploadingFile.response
    //                 }
    //             ));
    //             this.closeModal();
    //         }
    //     });
    // }

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

    // /**
    //  * Trigger update of variable to show current upload speed
    //  * @param speed
    //  */
    // updateCurrentSpeed(speed: string): void {
    //     if (this.lastUpdate === undefined) {
    //         this.lastUpdate = Date.now();
    //         this.setCurrentSpeed(speed);
    //     }
    //     // we only update current speed every 0.5 seconds
    //     if ((Date.now() - this.lastUpdate) > 500) {
    //         this.setCurrentSpeed(speed);
    //         this.lastUpdate = Date.now();
    //     }
    // }

    // /**
    //  * Update variable to show current upload speed
    //  * @param speed
    //  */
    // setCurrentSpeed(speed: string): void {
    //     if (speed) {
    //         this.currentSpeed = speed;
    //     }
    // }

    installInContainer(app: MarketplaceApplication): void {
        this.deploymentInProgress = true;
        this.appService.isAppDeployedInContainer(app.id).then(result => {
            if (!result) {
                const postURL = new Path(this.adminService.getContainerUrl())
                    .append('csars')
                    .toString();
                const tmpApp = new CsarUploadReference(app.csarURL, app.id);
                this.repositoryManagementService.installAppInContainer(tmpApp, postURL)
                    .toPromise()
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
        return new Observable<boolean>(observer => {
            this.http.head(url)
                .subscribe((response: HttpResponse<any>) => {
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
     * @param name string of the enter value
     * @return returns a Observable of the validity from the name
     */
    nameValidator(name: string): Observable<boolean> {
        // TODO do actual validation!
        return of(true);
    }
}
