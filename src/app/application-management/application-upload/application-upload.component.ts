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
import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NgUploaderOptions } from 'ngx-uploader';
import { ModalDirective } from 'ngx-bootstrap';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { GrowlMessageBusService } from '../../core/service/growl-message-bus.service';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { Application } from '../../core/model/application.model';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementActions } from '../application-management-actions';
import {MarketplaceApplication} from '../../core/model/marketplace-application.model';
import {DeploymentCompletionService} from '../../core/service/deployment-completion.service';
import {RepositoryManagementService} from '../../core/service/repository-management.service';
import { Path } from '../../core/util/path';

@Component({
  selector: 'opentosca-ui-application-upload',
  templateUrl: './application-upload.component.html',
  styleUrls: ['./application-upload.component.scss']
})
// Fixme: If modal is opened, closed, opened and closed again then an error is thrown since router navigates to applications/(modal:upload)
export class ApplicationUploadComponent implements OnInit, AfterViewInit {
    public deploymentInProgress = false;
    public deploymentDone = false;
    public max = 100;
    public dynamic = 0;
    public currentSpeed: string;
    public failureMessage: string;
    public uploadFile: any;
    public options: NgUploaderOptions;

    private zone: NgZone;
    private lastUpdate: number;

    public linkToWineryResourceForCompletion: string;
    public appToComplete: MarketplaceApplication;
    public startCompletionProcess: boolean;

    @ViewChild('uploadModal') public uploadModal: ModalDirective;

    ngOnInit(): void {

        this.zone = new NgZone({enableLongStackTrace: false});
        const postURL = new Path(this.adminService.getContainerAPIURL())
            .append('containerapi')
            .append('CSARs')
            .toString();

        this.options = {
            url: postURL,
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

    constructor(private adminService: ConfigurationService,
                private appService: ApplicationManagementService,
                private messageBus: GrowlMessageBusService,
                private deploymentService: DeploymentCompletionService,
                private repositoryManagementService: RepositoryManagementService,
                private ngRedux: NgRedux<AppState>,
                private router: Router,
                private logger: OpenToscaLoggerService) {
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
            if (data.status === 406) {
                this.failureMessage = data.statusText;
                const location = JSON.parse(data.response);
                this.linkToWineryResourceForCompletion = location ['Location']  as string;
                console.log(data);
                console.log(location);
                console.log(this.linkToWineryResourceForCompletion);
                this.deploymentService.getAppFromCompletionHandlerWinery(this.linkToWineryResourceForCompletion,
                    data.originalName.substr(0, data.originalName.lastIndexOf('.csar')))
                    .then(app => {
                        this.appToComplete = app;
                        this.startCompletionProcess = true;
                        this.resetUploadStats();
                    })
                    .catch(err => this.logger.handleError('[application-upload.component][getAppFromCompletionHandlerWinery]', err));

                console.log(this.appToComplete);

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
            const appPromises = [] as Array<Promise<Application>>;
            for (const ref of references) {
                if (ref.title !== 'Self') {
                    appPromises.push(this.appService.getAppDescription(ref.title).toPromise());
                }
            }
            Promise.all(appPromises)
                .then(apps => {
                    this.ngRedux.dispatch(ApplicationManagementActions.addContainerApplications(apps));
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


    installInContainer(app: MarketplaceApplication): void {
        this.deploymentInProgress = true;
        this.appService.isAppDeployedInContainer(app.id).then(result => {
            if (!result) {
                const postURL = new Path(this.adminService.getContainerAPIURL())
                    .append('containerapi')
                    .append('CSARs')
                    .toString();
                this.repositoryManagementService.installAppInContainer(app.csarURL, postURL)
                    .then(response => {
                        this.appService.isAppDeployedInContainer(app.id)
                            .then(output => {
                                if (output) {
                                    this.messageBus.emit(
                                        {
                                            severity: 'success',
                                            summary: 'Upload Succeeded',
                                            detail: 'Application was successfully completed and deployed to container'
                                        }
                                    );
                                    this.deploymentDone = true;
                                    this.updateApplicationsInStore();
                                    this.resetUploadStats();
                                    this.closeModal();
                                    this.logger.log('[deployment-completion.component][installed&deployedinContainer]',
                                        this.appToComplete.displayName);
                                } else {
                                    this.logger.log('[deployment-completion.component][installed&notdeployedinContainer]',
                                        this.appToComplete.displayName);
                                    this.messageBus.emit(
                                        {
                                            severity: 'error',
                                            summary: 'Error',
                                            detail: 'Application was not successfully uploaded and deployed.'
                                        }
                                    );

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
                this.messageBus.emit(
                    {
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Application is already deployed'
                    }
                );
                this.updateApplicationsInStore();
                this.closeModal();
                this.resetUploadStats();
            }

        });
    }

}
