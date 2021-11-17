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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class AuthLoaderService {

    constructor(private http: HttpClient) {
    }

    public loadImage(url: string): Observable<string> {
        return this.loadFile(url).pipe(map(blob => {
            return URL.createObjectURL(blob);
        }));
    }

    public loadFile(url: string): Observable<Blob> {
        return this.http.get(url, { responseType: 'blob' });
    }
}
