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
import * as _ from 'lodash';

export class Path {
    private pathSegments: Array<string> = [];

    constructor(path: string) {
        this.append(path);
    }

    public append(path: string): Path {
        if (path && path.startsWith('/')) {
            path = path.substr(1);
        }
        if (path && path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }
        this.pathSegments.push(path);
        return this;
    }

    public toString(): string {
        return _.join(this.pathSegments, '/');
    }
}
