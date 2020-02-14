import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    getAvailableInstances(postURL: string, toBePlaced: string[]): Observable<Map<string, string[]>> {
        return this.http.post<Map<string, string[]>>(postURL, toBePlaced, this.httpOptions);
    }
}
