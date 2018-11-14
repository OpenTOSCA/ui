/*
 * Copyright (c) 2018 University of Stuttgart.
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
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class LoggerService {

    constructor(private datePipe: DatePipe) {
    }

    public handleError(location: string, error: any): Promise<any> {
        console.error('[', new Date(), ']', location, ': ', error);
        return Promise.reject(error.message || error);
    }

    public handleObservableError(location: string, error: any): Observable<any> {
        console.error('[', new Date(), ']', location, ': ', error);
        if (error.json) {
            return throwError(error.json().error || error);
        } else {
            return throwError(error);
        }
    }

    public log(location: string, message: string): void {
        console.log('[', this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'), ']', location, ': ', message);
    }

    public error(location: string, message: string): void {
        console.error('[', this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'), ']', location, ': ', message);
    }
}
