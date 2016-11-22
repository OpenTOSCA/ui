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
import { Http, Headers } from "@angular/http";

@Injectable()
export class AdministrationService {

    // Default values
    private containerAPI = 'http://192.168.209.229:1337/containerapi';
    private buildPlanPath = '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan';
    private wineryAPI = 'http://192.168.209.229:8080/winery/servicetemplates/';
    private defaultAcceptHeaders = new Headers({'Accept': 'application/json'});

    constructor(private http: Http) {
    }

    getWineryAPIURL(): string {
        return this.wineryAPI;
    }

    setWineryAPIURL(url: string) {
        this.wineryAPI = url;
    }

    getContainerAPIURL(): string {
        return this.containerAPI;
    }

    setContainerAPIURL(url: string) {
        this.containerAPI = url;
    }

    getBuildPlanPath(): string {
        return this.buildPlanPath;
    }

    setBuildPlanPath(path: string) {
        this.buildPlanPath = path;
    }

    isContainerAvailable(): Promise<any> {
        return this.http.get(this.containerAPI, this.defaultAcceptHeaders)
            .toPromise();
    }

    isRepositoryAvailable(): Promise<any> {
        return this.http.get(this.wineryAPI, this.defaultAcceptHeaders)
            .toPromise();
    }
}
