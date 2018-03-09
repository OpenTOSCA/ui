/**
 * Copyright (c) 2018 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Wurster - initial implementation
 */

import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { DeploymentTest } from '../model/deployment-test';
import { ServiceTemplateInstance } from '../model/service-template-instance.model';

@Injectable()
export class DeploymentTestService {

    constructor(private http: Http, private logger: OpenToscaLoggerService) {
    }

    getDeploymentTests(serviceTemplateInstance: ServiceTemplateInstance): Observable<Array<DeploymentTest>> {
        const options = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(serviceTemplateInstance._links['deploymenttests'].href, options)
            .map((response: Response) => response.json())
            .map((data: any) => data.items)
            .catch(error => this.logger.handleObservableError('[deployment-test.service][getDeploymentTests]', error));
    }

    runDeploymentTest(serviceTemplateInstance: ServiceTemplateInstance): Observable<Response> {
        const options = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.post(serviceTemplateInstance._links['deploymenttests'].href, options);
    }
}
