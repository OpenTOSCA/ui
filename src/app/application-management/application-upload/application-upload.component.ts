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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/service/logger.service';
import { AppState } from '../../store/app-state.model';
import { DeploymentCompletionService } from '../../core/service/deployment-completion.service';
import { RepositoryService } from '../../core/service/repository.service';
import { Path } from '../../core/path';
import { GrowlActions } from '../../core/growl/growl-actions';
import { CsarUploadReference } from '../../core/model/csar-upload-request.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {MarketplaceApplication} from "../../core/model/marketplace-application.model";

@Component({
    selector: 'opentosca-application-upload',
    templateUrl: './application-upload.component.html',
    styleUrls: ['./application-upload.component.scss']
})

export class ApplicationUploadComponent implements OnInit {
    @Input() showModal: boolean;
    @Output() showModalChange = new EventEmitter<boolean>();
    @Output() uploadComplete = new EventEmitter<void>();
    @Output() completionRequest = new EventEmitter();
    public deploymentInProgress = false;
    public fileSelected = false;
    public showUploadProgressLabel = false;
    public postURL = new Path(this.adminService.getContainerUrl())
        .append('csars')
        .toString();
    public bytesUploaded = 0;
    public bytesTotal = 0;
    public linkToWineryResourceForCompletion: string;
    public appToComplete: MarketplaceApplication;
    public showCompletionDialog = false;
    public initializeCompletionComponent = false;

    // temporary data derived from the user input for the url upload
    public tempData = {
        cur: new CsarUploadReference(null, null),
        validURL: false,
        validName: false
    };

    constructor(
        private adminService: ConfigurationService,
        private appService: ApplicationManagementService,
        private deploymentService: DeploymentCompletionService,
        private repositoryManagementService: RepositoryService,
        private ngRedux: NgRedux<AppState>,
        private router: Router,
        private http: HttpClient,
        private repoService: RepositoryService,
        private logger: LoggerService) {

    }

    ngOnInit(): void {
    }

    /**
     * Closes the upload modal and update showModal to false.
     */
    closeModal(): void {
        this.showModal = false;
        this.showModalChange.emit(false);
    }

    /**
     * Handler for file selection.
     */
    onSelect(): void {
        this.fileSelected = true;
        this.deploymentInProgress = false;
    }

    /**
     * Handler for clear in file selection component.
     */
    onClear(): void {
        this.fileSelected = false;
        this.deploymentInProgress = false;
    }

    /**
     * Handler for upload progress of file upload component.
     */
    onUploadProgress(event: ProgressEvent): void {
        this.bytesUploaded = event.loaded;
        this.bytesTotal = event.total;
        this.deploymentInProgress = this.bytesUploaded === this.bytesTotal;
    }

    /**
     * Handler for upload finished event of file upload component.
     * This handler is called when the XHR request returns, i.e., when deployment in container is done.
     */
    onUploadFinished(event): void {
        // This is called when XHR request returns
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'success',
                summary: 'Upload Succeeded',
                detail: 'New application was successfully uploaded and deployed to container!'
            }
        ));
        this.uploadComplete.emit();
        this.uploadComplete.emit();
        this.closeModal();
    }

    /**
     * Handler for emitted errors of file upload component.
     * If topology completion is required this is caught within this handler.
     */
    onUploadError(event): void {
        switch (event.xhr.status) {
            case 406:
                const response = JSON.parse(event.xhr.response);
                this.linkToWineryResourceForCompletion = response['Location'];
                this.initializeCompletionComponent = true;
                this.showCompletionDialog = true;
                this.closeModal();
                break;
            case 409:
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application was not successfully uploaded. Application already exists in container.'
                    }
                ));
                this.closeModal();
                break;
            case 500:
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application was not successfully uploaded and deployed. Server responded: ' + event.responseText
                    }
                ));
                this.closeModal();
                break;
        }
    }

    /**
     * Starts upload of selected url to container
     */
    startURLUpload(): void {
        const postURL = new Path(this.adminService.getContainerUrl())
            .append('csars')
            .toString();
        this.repositoryManagementService.installApplication(this.tempData.cur, postURL)
            .toPromise()
            .then(() => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Upload Succeeded',
                        detail: 'New Application was successfully uploaded and deployed to container'
                    }
                ));
                this.uploadComplete.emit();
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
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'info',
                summary: 'Deploying Container ' + this.tempData.cur.name,
                detail: 'Your container is uploaded and installed in the background.'
            }
        ));
        this.closeModal();
        this.resetUploadStats();
    }

    /**
     * Reset upload state variables
     */
    resetUploadStats(): void {
        this.deploymentInProgress = false;
        this.tempData.cur.url = null;
        this.tempData.cur.name = null;
        this.tempData.validURL = false;
        this.tempData.validName = false;
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
            this.http.head<HttpResponse<Object>>(url)
                .subscribe((response: HttpResponse<any>) => {
                        observer.next(response.status === 200);
                    },
                    () => {
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

    /**
     * Handler for successful completion of completion component.
     */
    onCompletionSuccess(app: MarketplaceApplication): void {
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'success',
                summary: 'Completion Succeeded',
                detail: `The completion process was successful, app "${app.displayName}" is now getting installed in container.`
            }
        ));

        // Todo: Container should check itself if the app already exists and respond appropriately
        const postURL = new Path(this.adminService.getContainerUrl())
            .append('csars')
            .toString();
        this.repoService.installApplication({ url: app.csarURL, name: app.id }, postURL)
            .subscribe(() => {
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'success',
                        summary: 'Completed Application Installed',
                        detail: `The completed app "${app.displayName}" was successfully installed in container.`
                    }
                ));
            }, err => {
                this.logger.error('[application-overview.component][completionSuccess]', err);
                this.ngRedux.dispatch(GrowlActions.addGrowl(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: `The completed app "${app.displayName}" was not installed successfully in container: ${err}.`
                    }
                ));
            });
    }

    /**
     * Handler for emitted errors of completion component
     */
    onCompletionError(errorMessage: string): void {
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'error',
                summary: 'Error',
                detail: 'Error at Topology Completion: ' + errorMessage
            }
        ));
        this.stopCompletionProcess();
    }

    onCompletionAbort(): void {
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'info',
                summary: 'Info',
                detail: 'Topology Completion aborted.'
            }
        ));
        this.stopCompletionProcess();
    }

    /**
     * Hides the completion dialog
     */
    stopCompletionProcess(): void {
        this.showCompletionDialog = false;
        this.appToComplete = null;
        this.linkToWineryResourceForCompletion = null;
    }
}
