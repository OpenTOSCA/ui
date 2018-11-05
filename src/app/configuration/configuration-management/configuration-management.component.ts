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
import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { FormControl } from '@angular/forms';
import { ConfigurationService } from '../configuration.service';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { AppState } from '../../store/app-state.model';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BreadcrumbActions } from '../../core/component/breadcrumb/breadcrumb-actions';

@Component({
    selector: 'opentosca-configuration-management',
    templateUrl: './configuration-management.component.html',
    styleUrls: ['./configuration-management.component.scss']
})
export class ConfigurationManagementComponent implements OnInit {

    @select(['administration', 'containerUrl']) containerUrl: Observable<string>;
    public containerUrlControl: FormControl = new FormControl();
    public containerUrlAvailable: boolean;

    @select(['administration', 'repositoryUrl']) repositoryUrl: Observable<string>;
    public repositoryUrlControl: FormControl = new FormControl();
    public repositoryUrlAvailable: boolean;


    @select(['administration', 'planLifecycleInterface']) planLifecycleInterface: Observable<string>;
    public planLifecycleInterfaceControl: FormControl = new FormControl();
    @select(['administration', 'planOperationInitiate']) planOperationInitiate: Observable<string>;
    public planOperationInitiateControl: FormControl = new FormControl();
    @select(['administration', 'planOperationTerminate']) planOperationTerminate: Observable<string>;
    public planOperationTerminateControl: FormControl = new FormControl();

    constructor(private configService: ConfigurationService,
                private ngRedux: NgRedux<AppState>,
                private logger: OpenToscaLoggerService) {
    }

    ngOnInit(): void {

        this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([{ label: 'Administration', routerLink: ['/administration'] }]));

        this.containerUrl.subscribe(() => this.checkAvailabilityOfContainer());
        this.repositoryUrl.subscribe(() => this.checkAvailabilityOfRepository());

        this.containerUrlControl.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(newValue => this.updateContainerUrl(newValue));
        this.repositoryUrlControl.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(newValue => this.updateRepositoryUrl(newValue));

        this.planLifecycleInterfaceControl.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(newValue => this.updatePlanLifecycleInterface(newValue));
        this.planOperationInitiateControl.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(newValue => this.updatePlanOperationInitiate(newValue));
        this.planOperationTerminateControl.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(newValue => this.updatePlanOperationTerminate(newValue));
    }

    checkAvailabilityOfContainer(): void {
        this.configService.isContainerAvailable()
            .subscribe(() => this.containerUrlAvailable = true,
                () => this.containerUrlAvailable = false);
    }

    checkAvailabilityOfRepository(): void {
        this.configService.isRepositoryAvailable()
            .subscribe(() => this.repositoryUrlAvailable = true,
                () => this.repositoryUrlAvailable = false);
    }

    updateContainerUrl(newValue: string): void {
        this.configService.setContainerUrl(newValue);
        this.logger.log('[administration.component][updateRepositoryUrl] Updated container URL to: ',
            this.configService.getContainerUrl());
    }

    updateRepositoryUrl(newValue: string): void {
        this.configService.setRepositoryUrl(newValue);
        this.logger.log('[administration.component][updateRepositoryUrl] Updated repository URL to: ',
            this.configService.getRepositoryUrl());
    }

    updatePlanLifecycleInterface(newValue: string): void {
        this.configService.setPlanLifecycleInterface(newValue);
        this.logger.log('[administration.component][updatePlanLifecycleInterface] Updated lifecycle interface name to: ',
            this.configService.getPlanLifecycleInterface());
    }

    updatePlanOperationInitiate(newValue: string): void {
        this.configService.setPlanOperationInitiate(newValue);
        this.logger.log('[administration.component][updatePlanOperationInitiate] Updated initiate plan name to: ',
            this.configService.getPlanOperationInitiate());
    }

    updatePlanOperationTerminate(newValue: string): void {
        this.configService.setPlanOperationTerminate(newValue);
        this.logger.log('[administration.component][updatePlanOperationTerminate] Updated termination plan name to: ',
            this.configService.getPlanOperationTerminate());
    }
}
