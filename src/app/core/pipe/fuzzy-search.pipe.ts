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

import { Pipe, PipeTransform } from '@angular/core';
import * as Fuse from 'fuse.js';
import { FuseOptions } from 'fuse.js';

@Pipe({ name: 'fuzzySearch' })
export class FuzzySearchPipe implements PipeTransform {

    transform<T, K extends keyof T>(items: T[], searchTerm: string, searchFields: Array<K>): T[] {

        if (!searchTerm || searchTerm.length === 0) {
            return items;
        }

        console.log('[fuzzy-search.pipe] Search term:', searchTerm);
        console.log('[fuzzy-search.pipe] Items:', items);

        const options: FuseOptions<T> = {
            // See http://fusejs.io
            shouldSort: true,
            threshold: 0.4,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            keys: searchFields
        };

        const fuse: Fuse<T> = new Fuse(items, options);
        const filteredItems: T[] = fuse.search(searchTerm);

        console.log('[fuzzy-search.pipe] Filtered Items:', filteredItems);
        return filteredItems;
    }
}
