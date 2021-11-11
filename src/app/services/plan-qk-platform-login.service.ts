/*
 * Copyright (c) 2021 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */

import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root',
})
export class PlanQkPlatformLoginService {

    constructor(private readonly keycloak: KeycloakService) {
        // this.keycloak.getKeycloakInstance().onTokenExpired = () => {
        //     console.log('expired ' + new Date());
        //     from(this.keycloak.updateToken(50)).subscribe((refreshed) => {
        //         if (refreshed) {
        //             console.log('refreshed ' + new Date());
        //         } else {
        //             console.log('not refreshed ' + new Date());
        //         }
        //     }, (error) => {
        //         console.error('Failed to refresh token ' + new Date());
        //         console.error(error);
        //     });
        // }
    }

    public loginToPlanQkPlatform(): void {
        this.keycloak.login();
    }

    public isLoggedIn(): Observable<boolean> {
        return from(this.keycloak.isLoggedIn());
    }

    public getBearerToken(): Observable<string> {
        return from(this.keycloak.getToken());
    }

    public getRefreshToken(): string {
        return this.keycloak.getKeycloakInstance().refreshToken;
    }

    public logoutFromPlanQkPlatform(): void {
        this.keycloak.logout();
    }

}
