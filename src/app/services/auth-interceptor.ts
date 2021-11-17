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
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, } from '@angular/common/http';
import { concatAll, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PlanQkPlatformLoginService } from './plan-qk-platform-login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private planqkPlatformLoginService: PlanQkPlatformLoginService) {
    }

    intercept(
        req: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        if (req.url.toString().includes('platform.planqk.de')) {
            return this.planqkPlatformLoginService
                .getBearerToken()
                .pipe(
                    map((bearerToken: string) =>
                        next.handle(this.addBearerToken(req, bearerToken))
                    )
                )
                .pipe(concatAll());
        }
        return next.handle(req);
    }

    addBearerToken(
        request: HttpRequest<unknown>,
        bearerToken: string
    ): HttpRequest<unknown> {
        if (bearerToken) {
            return request.clone({
                setHeaders: { Authorization: 'Bearer ' + bearerToken },
            });
        }
        return request;
    }
}
