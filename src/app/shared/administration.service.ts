/*******************************************************************************
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *******************************************************************************/
import {Injectable} from '@angular/core';

@Injectable()
export class AdministrationService {

    private _containerAPI = 'http://192.168.209.229:1337/containerapi';
    private _buildPlanPath = '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan';
    private _wineryAPI = 'http://192.168.209.229:8080/winery/servicetemplates/';

    constructor() {
    }

    getWineryAPIURL(): string {
        return this._wineryAPI;
    }

    setWineryAPIURL(url: string) {
        this._wineryAPI = url;
    }

    getContainerAPIURL(): string {
        return this._containerAPI;
    }

    setContainerAPIURL(url: string) {
        this._containerAPI = url;
    }

    getBuildPlanPath(): string {
        return this._buildPlanPath;
    }

    setBuildPlanPath(path: string) {
        this._buildPlanPath = path;
    }

}
