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

import * as _ from 'lodash';

export class ObjectHelper {
    /**
     * Searches for a property in a object, which can contain nested objects and arrays
     * and returns all matches.
     * @param obj
     * @param property
     * @returns {Array<Object>}
     */
    public static getObjectsByPropertyDeep(obj: any, property: string): Array<Object> {
        if (_.has(obj, property)) {
            return [obj];
        } else {
            return _.flatten(_.map(obj, (type) => {
                return typeof type == 'object' ? ObjectHelper.getObjectsByPropertyDeep(type, property) : [];
            }), true);
        }
    }
}


