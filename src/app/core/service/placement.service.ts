import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { Path } from '../path';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementService } from './application-management.service';
import { PlacementModel } from '../model/placement.model';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {

    httpOptions = {
        headers: new HttpHeaders({
            'content-type': 'application/json'
        })
    };

    constructor(private http: HttpClient, private logger: LoggerService, private ngRedux: NgRedux<AppState>,
                private appService: ApplicationManagementService) {
    }

    /**
     *  This method fetches all available instances from the API
     *  that can be used to place the node templates of the node template list
     * @param nodeTemplateList: node templates that need to be placed, i.e. that are of abstract OperatingSystem node type
     */
    getAvailableInstances(csarId: string, placementModel: PlacementModel): void {
        this.appService.getFirstServiceTemplateOfCsar(csarId).subscribe(
            data => {
                 const postUrl = new Path(data)
                    .append('placement')
                    .toString();
                this.http.post<any>(postUrl, placementModel, this.httpOptions).subscribe(
                    data => {
                        // reply here
                        console.log(data);
                    }
                );
            }
        );
    }

}
