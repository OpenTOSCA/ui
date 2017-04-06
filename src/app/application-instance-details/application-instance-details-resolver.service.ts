/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OpenToscaLogger } from '../shared/util/OpenToscaLogger';
import { Observable } from 'rxjs';
import { ApplicationInstanceService } from '../shared/application-instance.service';
import { ApplicationInstance } from '../shared/model/application-instance.model';

@Injectable()
export class ApplicationInstanceDetailsResolver implements Resolve<ApplicationInstance> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ApplicationInstance> {


        return this.appInstService.loadApplicationInstance(route.params['id'], route.params['instID'])
            .catch(reason => {
                return this.logger.handleError('[application-instance-details-resolver.service][resolve]', reason);
            });
    }

    constructor(private appInstService: ApplicationInstanceService, private logger: OpenToscaLogger) {
    }
}
