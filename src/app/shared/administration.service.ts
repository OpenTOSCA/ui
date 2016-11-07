/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Injectable} from '@angular/core';

@Injectable()
export class AdministrationService {

    private _containerAPI = 'http://192.168.209.229:1337/containerapi';
    private _buildPlanPath = '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan';
    private _wineryAPI = 'http://192.168.209.229:8080/servicetemplates/';

    constructor() {
    }

    get wineryAPIURL(): string {
        return this._wineryAPI;
    }

    set wineryAPIURL(url: string) {
        this._wineryAPI = url;
    }

    get containerAPIURL(): string {
        return this._containerAPI;
    }

    set containerAPIURL(url: string) {
        this._containerAPI = url;
    }

    get buildPlanPath(): string {
        return this._buildPlanPath;
    }

    set buildPlanPath(path: string) {
        this._buildPlanPath = path;
    }

}
