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
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../store/app-state.model';
import { ConfigurationActions } from './configuration-actions';
import { ApplicationManagementActions } from '../application-management/application-management-actions';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ConfigurationService {

    constructor(private http: HttpClient,
                private ngRedux: NgRedux<AppState>) {
    }

    isRepositoryAvailable(url: string): Observable<boolean> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(url, { ...httpOptions, responseType: 'text', observe: 'response' }).pipe(
            map((response: HttpResponse<Object>) => (response.status >= 200 && response.status < 400)),
            catchError(() => of(false))
        );
    }

    getContainerUrl(): string {
        return this.ngRedux.getState().administration.containerUrl;
    }

    setContainerUrl(url: string) {
        this.ngRedux.dispatch(ConfigurationActions.updateContainerUrl(url));
        this.ngRedux.dispatch(ApplicationManagementActions.clearApplications());
    }

    isContainerAvailable(): Observable<Object> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(this.ngRedux.getState().administration.containerUrl, httpOptions);
    }

    setPlanLifecycleInterface(name: string) {
        this.ngRedux.dispatch(ConfigurationActions.updatePlanLifecycleInterface(name));
    }

    getPlanLifecycleInterface(): string {
        return this.ngRedux.getState().administration.planLifecycleInterface;
    }

    setPlanOperationInitiate(name: string) {
        this.ngRedux.dispatch(ConfigurationActions.updatePlanOperationInitiate(name));
    }

    getPlanOperationInitiate(): string {
        return this.ngRedux.getState().administration.planOperationInitiate;
    }

    setPlanOperationTerminate(name: string) {
        this.ngRedux.dispatch(ConfigurationActions.updatePlanOperationTerminate(name));
    }

    getPlanOperationTerminate(): string {
        return this.ngRedux.getState().administration.planOperationTerminate;
    }
}
