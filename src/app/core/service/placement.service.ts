import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { NodeTemplate } from '../model/node-template.model';
import { Path } from '../path';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {

    httpOptions = {
        headers: new HttpHeaders({
            'Accept': 'application/json'
        })
    };

    constructor(private http: HttpClient, private logger: LoggerService, private ngRedux: NgRedux<AppState>) {
    }

    getAvailableInstances(nodeTemplateList: NodeTemplate[]): Observable<any> {
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('placement')
            .toString();
        const formData: FormData = new FormData();
        formData.append('nodeTemplateList', JSON.stringify(nodeTemplateList));
        return this.http.post<any>(url, formData, this.httpOptions);
    }

}
