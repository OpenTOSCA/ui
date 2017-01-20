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
