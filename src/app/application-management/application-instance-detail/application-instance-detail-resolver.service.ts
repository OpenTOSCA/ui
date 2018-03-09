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
 *     Michael Wurster - initial implementation
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { OpenToscaLoggerService } from '../../core/service/open-tosca-logger.service';
import { ApplicationInstanceManagementService } from '../../core/service/application-instance-management.service';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';

@Injectable()
export class ApplicationInstanceDetailResolverService implements Resolve<ServiceTemplateInstance> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServiceTemplateInstance> {
        return this.appInstService.getServiceTemplateInstance(route.params['id'], route.params['instID'])
            .catch(reason => {
                return this.logger.handleError('[application-instance-details-resolver.service][resolve]', reason);
            });
    }

    constructor(private appInstService: ApplicationInstanceManagementService, private logger: OpenToscaLoggerService) {
    }
}
