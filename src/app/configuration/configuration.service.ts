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
import { RepositoryManagementActions } from '../repository-management/repository-management-actions';
import { ApplicationManagementActions } from '../application-management/application-management-actions';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ConfigurationService {

    constructor(private http: HttpClient,
                private ngRedux: NgRedux<AppState>) {
    }

    /**
     * Returns wineryAPI
     * @returns {string}
     */
    getWineryAPIURL(): string {
        return this.ngRedux.getState().administration.repositoryUrl;
    }

    /**
     * Sets wineryAPI to new value
     * @param url
     */
    setWineryAPIURL(url: string) {
        this.ngRedux.dispatch(ConfigurationActions.updateRepositoryURL(url));
        this.ngRedux.dispatch(RepositoryManagementActions.clearRepositoryApplications());
    }

    /**
     * Returns containerAPIURL
     * @returns {string}
     */
    getContainerAPIURL(): string {
        return this.ngRedux.getState().administration.containerUrl;
    }

    /**
     * Sets containerAPIURL to new value
     * @param url
     */
    setContainerAPIURL(url: string) {
        this.ngRedux.dispatch(ConfigurationActions.updateContainerURL(url));
        this.ngRedux.dispatch(ApplicationManagementActions.clearContainerApplication());
    }

    /**
     * Returns buildPlanPath
     * @returns {string}
     */
    getBuildPlanPath(): string {
        return this.ngRedux.getState().administration.buildPlanPath;
    }

    /**
     * Returns buildPlanPath
     * @returns {string}
     */
    getTerminationPlanPath(): string {
        return this.ngRedux.getState().administration.terminationPlanPath;
    }

    /**
     * Sets buildPlanPath to new value
     * @param path
     */
    setBuildPlanPath(path: string) {
        this.ngRedux.dispatch(ConfigurationActions.updateBuildPlanPath(path));
    }

    /**
     * Sets terminationPlanPath to new value
     * @param path
     */
    setTerminationPlanPath(path: string) {
        this.ngRedux.dispatch(ConfigurationActions.updateTerminationPlanPath(path));
    }

    /**
     * Checks if container API responds
     * @returns {Promise<Response>}
     */
    isContainerAvailable(): Observable<Object> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(this.ngRedux.getState().administration.containerUrl, httpOptions);
    }

    /**
     * Checks if repository API responds
     * @returns {Promise<Response>}
     */
    isRepositoryAvailable(): Observable<Object> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this.http.get(this.ngRedux.getState().administration.repositoryUrl, httpOptions);
    }
}
