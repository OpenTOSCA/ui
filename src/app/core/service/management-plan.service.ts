/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 */

import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { ServiceTemplateInstance } from '../model/service-template-instance.model';
import { Observable } from 'rxjs/Rx';
import { PlanList } from '../model/plan-list.model';
import { OpenToscaLoggerService } from './open-tosca-logger.service';

@Injectable()
export class ManagementPlanService {

    private reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

    constructor(private http: Http, private logger: OpenToscaLoggerService) {
    }

    getManagementPlans(instance: ServiceTemplateInstance): Observable<PlanList> {
        return this.http.get(instance._links['managementplans'].href)
            .map((response: Response) => response.json())
            .catch(err => this.logger.handleObservableError('[management-plan.service][getManagementPlans]', err));
    }
}
