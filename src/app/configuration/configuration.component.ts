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
import { Component, Inject, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { FormControl } from '@angular/forms';
import { ConfigurationService } from './configuration.service';
import { LoggerService } from '../core/service/logger.service';
import { AppState } from '../store/app-state.model';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { ConfigurationActions } from './configuration-actions';

@Component({
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

    @select(['administration', 'containerUrl']) containerUrl: Observable<string>;
    public containerUrlControl: FormControl = new FormControl();
    public containerUrlAvailable: boolean;

    @select(['administration', 'planLifecycleInterface']) planLifecycleInterface: Observable<string>;
    public planLifecycleInterfaceControl: FormControl = new FormControl();
    @select(['administration', 'planOperationInitiate']) planOperationInitiate: Observable<string>;
    public planOperationInitiateControl: FormControl = new FormControl();
    @select(['administration', 'planOperationTerminate']) planOperationTerminate: Observable<string>;
    public planOperationTerminateControl: FormControl = new FormControl();

    constructor(private configService: ConfigurationService, private ngRedux: NgRedux<AppState>,
                private logger: LoggerService, @Inject(DOCUMENT) private document: any) {
    }

    ngOnInit(): void {
        this.containerUrl.subscribe(value => {
            if (value.length === 0) {
                this.ngRedux.dispatch(ConfigurationActions.updateContainerUrl(`http://${this.document.location.hostname}:1337`));
            } else {
                this.checkAvailabilityOfContainer();
                this.containerUrlControl.setValue(value);
            }
        });
        this.planLifecycleInterface.subscribe(value => this.planLifecycleInterfaceControl.setValue(value));
        this.planOperationInitiate.subscribe(value => this.planOperationInitiateControl.setValue(value));
        this.planOperationTerminate.subscribe(value => this.planOperationTerminateControl.setValue(value));

        this.containerUrlControl.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(newValue => this.updateContainerUrl(newValue));
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

    updateContainerUrl(newValue: string): void {
        this.configService.setContainerUrl(newValue);
        this.logger.log('[administration.component][updateRepositoryItems] Updated container URL to: ',
            this.configService.getContainerUrl());
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
