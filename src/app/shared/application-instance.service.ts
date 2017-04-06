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
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AdministrationService } from '../administration/administration.service';
import { OpenToscaLogger } from './helper';
import { ApplicationService } from './application.service';

@Injectable()
export class ApplicationInstanceService {

    /**
     * Helper that ensures that appID always ends with .csar
     * @param appID
     * @returns {string}
     */
    public fixAppID(appID: string): string {
        return this.appService.fixAppID(appID);
    }

    constructor(private http: Http,
                private adminService: AdministrationService,
                private logger: OpenToscaLogger,
                private appService: ApplicationService) {
    }

    terminateApplicationInstance(appInstanceURL: string): Promise<any> {
        // Todo Implement
        throw new Error ('Not implemented yet');
        /*this.logger.log('[application-instance.service][terminateApplicationInstance]', 'Trying to delete: ' + appInstanceURL);
        return this.http.delete(appInstanceURL)
            .toPromise();*/
    }
}
