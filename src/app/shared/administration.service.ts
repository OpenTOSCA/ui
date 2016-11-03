/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Injectable} from '@angular/core';

@Injectable()
export class AdministrationService {

    private containerAPI = 'http://192.168.209.229:1337/containerapi';
    private buildPlanPath = '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan';

    constructor() {
    }

    getContainerAPIUrl(): string {
        return this.containerAPI;
    }

    setContainerAPIUrl(url: string): void {
        this.containerAPI = url;
    }

    getBuildPlanPath(): string {
        return this.buildPlanPath;
    }

    setBuildPlanPath(path: string): void {
        this.buildPlanPath = path;
    }

}
