/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../redux/store';
import { OpenTOSCAUiActions } from '../redux/actions';

@Injectable()
export class AdministrationService {

    // Default values
    private defaultAcceptHeaders = new Headers({'Accept': 'application/json'});

    constructor(private http: Http,
                private ngRedux: NgRedux<IAppState>) {
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
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateRepositoryURL(url));
        this.ngRedux.dispatch(OpenTOSCAUiActions.clearRepositoryApplications());
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
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateContainerURL(url));
        this.ngRedux.dispatch(OpenTOSCAUiActions.clearContainerApplication());
    }

    /**
     * Returns buildPlanPath
     * @returns {string}
     */
    getBuildPlanPath(): string {
        return this.ngRedux.getState().administration.buildPlanPath;
    }

    /**
     * Sets buildPlanPath to new value
     * @param path
     */
    setBuildPlanPath(path: string) {
        this.ngRedux.dispatch(OpenTOSCAUiActions.updateBuildPlanPath(path));
    }

    /**
     * Checks if container API responds
     * @returns {Promise<any>}
     */
    isContainerAvailable(): Promise<any> {
        return this.http.get(this.ngRedux.getState().administration.containerAPI, this.defaultAcceptHeaders)
            .toPromise();
    }

    /**
     * Checks if repository API responds
     * @returns {Promise<any>}
     */
    isRepositoryAvailable(): Promise<any> {
        return this.http.get(this.ngRedux.getState().administration.repositoryAPI, this.defaultAcceptHeaders)
            .toPromise();
    }

    /**
     * Returns default headers to accept application/json
     * @returns {Headers}
     */
    getDefaultAcceptJSONHeaders(): Headers {
        return this.defaultAcceptHeaders;
    }
}
