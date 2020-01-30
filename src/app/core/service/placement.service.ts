import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    constructor(private http: HttpClient) {
    }

    /**
     *  This method fetches all available instances from the API
     *  that can be used to place the node templates of the node template list
     * @param nodeTemplateList: node templates that need to be placed, i.e. that are of abstract OperatingSystem node
     *     type
     */
    getAvailableInstances(postURL: string, placementModel: PlacementModel): Observable<PlacementNodeTemplate[]> {
        return this.http.post<PlacementNodeTemplate[]>(postURL, placementModel, this.httpOptions);
    }
}
