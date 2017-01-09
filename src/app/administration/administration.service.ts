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

@Injectable()
export class AdministrationService {

    // Default values
    private containerAPI = 'http://opentosca-dev.iaas.uni-stuttgart.de:1337/containerapi';
    private buildPlanPath = '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan';
    private wineryAPI = 'http://opentosca-dev.iaas.uni-stuttgart.de:8080/winery/servicetemplates/';
    private defaultAcceptHeaders = new Headers({'Accept': 'application/json'});

    constructor(private http: Http) {
    }

    /**
     * Returns wineryAPI
     * @returns {string}
     */
    getWineryAPIURL(): string {
        return this.wineryAPI;
    }

    /**
     * Sets wineryAPI to new value
     * @param url
     */
    setWineryAPIURL(url: string) {
        this.wineryAPI = url;
    }

    /**
     * Returns containerAPIURL
     * @returns {string}
     */
    getContainerAPIURL(): string {
        return this.containerAPI;
    }

    /**
     * Sets containerAPIURL to new value
     * @param url
     */
    setContainerAPIURL(url: string) {
        this.containerAPI = url;
    }

    /**
     * Returns buildPlanPath
     * @returns {string}
     */
    getBuildPlanPath(): string {
        return this.buildPlanPath;
    }

    /**
     * Sets buildPlanPath to new value
     * @param path
     */
    setBuildPlanPath(path: string) {
        this.buildPlanPath = path;
    }

    /**
     * Checks if container API responds
     * @returns {Promise<any>}
     */
    isContainerAvailable(): Promise<any> {
        return this.http.get(this.containerAPI, this.defaultAcceptHeaders)
            .toPromise();
    }

    /**
     * Checks if repository API responds
     * @returns {Promise<any>}
     */
    isRepositoryAvailable(): Promise<any> {
        return this.http.get(this.wineryAPI, this.defaultAcceptHeaders)
            .toPromise();
    }
}
