/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Injectable} from '@angular/core';

@Injectable()
export class AdministrationService {

    private _containerAPI = 'http://192.168.209.229:1337/containerapi';
    private _buildPlanPath = '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan';
    private _wineryAPI = 'http://localhost:8080/servicetemplates/';

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
