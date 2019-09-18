import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { NodeTemplate } from '../model/node-template.model';
import { Path } from '../path';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { Observable } from 'rxjs';
import { ServiceTemplate } from '../model/service-template.model';
import { ApplicationManagementService } from './application-management.service';

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
    getAvailableInstances(csarId: string, nodeTemplateList: NodeTemplate[]): Observable<any> {
        console.log(this.appService.getFirstServiceTemplateOfCsar(csarId));
        const url = new Path(this.ngRedux.getState().administration.containerUrl)
            .append('csars')
            .append(csarId)
            .append('servicetemplates')
            .append('%257Bhttp:%252F%252Fopentosca.org%252Fservicetemplates%257DMyTinyToDo_Bare_Docker_AbstractOS')
            .append('placement')
            .toString();
        const formData: FormData = new FormData();
        formData.append('csar', csarId);
        formData.append('servicetemplate', '%257Bhttp:%252F%252Fopentosca.org%252Fservicetemplates%257DMyTinyToDo_Bare_Docker_AbstractOS');
        formData.append('nodetemplates', JSON.stringify(nodeTemplateList));
        return this.http.post<any>(url, formData, this.httpOptions);
    }

}
