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
 */
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import 'rxjs/add/operator/toPromise';
import { AppState } from '../store/app-state.model';
import { ConfigurationActions } from './configuration-actions';
import { RepositoryManagementActions } from '../repository-management/repository-management-actions';
import { ApplicationManagementActions } from '../application-management/application-management-actions';

@Injectable()
export class ConfigurationService {

    constructor(private http: Http,
                private ngRedux: NgRedux<AppState>) {
    }

    /**
     * Returns wineryAPI
     * @returns {string}
     */
    getWineryAPIURL(): string {
        return this.ngRedux.getState().administration.repositoryAPI;
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
        return this.ngRedux.getState().administration.containerAPI;
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
    isContainerAvailable(): Promise<Response> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(this.ngRedux.getState().administration.containerAPI, reqOpts)
            .toPromise();
    }

    /**
     * Checks if repository API responds
     * @returns {Promise<Response>}
     */
    isRepositoryAvailable(): Promise<Response> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(this.ngRedux.getState().administration.repositoryAPI, reqOpts)
            .toPromise();
    }

}
