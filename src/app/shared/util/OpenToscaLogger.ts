/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal
 */

import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class OpenToscaLogger {

    constructor(private datePipe: DatePipe) {
    }

    /**
     * Print errors to console
     * @param location string that indicates where the error occurred
     * @param error
     * @returns {Promise<void>|Promise<T>}
     */
    public handleError(location: string, error: any): Promise<any> {
        console.error('[', new Date(), ']', location, ': ', error);
        return Promise.reject(error.message || error);
    }

    public handleObservableError(location: string, error: any): Observable<any> {
        console.error('[', new Date(), ']', location, ': ', error);
        return Observable.throw(error.json().error || error);
    }

    /**
     * Print log messages to console
     * @param location
     * @param message
     */
    public log(location: string, message: string): void {
        console.log('[',  this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'), ']', location, ': ', message);
    }
}
