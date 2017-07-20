import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { PlanInstance } from '../model/new-api/plan-instance.model';
import { OpenToscaLoggerService } from './open-tosca-logger.service';

@Injectable()
export class BuildplanMonitoringService {

    constructor(
            private http: Http,
            private logger: OpenToscaLoggerService) {
    }

    getBuildPlan(url: string): Observable<PlanInstance> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(url, reqOpts)
            .map((response: Response) => response.json())
            .catch(err => this.logger.handleObservableError('[buildplan-monitor.service][getBuildPlan]', err));
    }

}
