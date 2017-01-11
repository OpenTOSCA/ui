/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal
 */

export class ErrorHandler {
    /**
     * Print errors to console
     * @param location string that indicates where the error occurred
     * @param error
     * @returns {Promise<void>|Promise<T>}
     */
    public static handleError(location: string, error: any): Promise<any> {
        console.error('An error occurred in ', location, ': ', error);
        return Promise.reject(error.message || error);
    }
}
