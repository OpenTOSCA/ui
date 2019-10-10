import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { ApplicationManagementService } from './application-management.service';
import { PlacementModel } from '../model/placement.model';
import { Observable } from 'rxjs';
import { PlacementNodeTemplate } from '../model/placement-node-template.model';

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
    getAvailableInstances(postURL: string, placementModel: PlacementModel): Observable<PlacementNodeTemplate[]> {
        return this.http.post<PlacementNodeTemplate[]>(postURL, placementModel, this.httpOptions);

    }
}
