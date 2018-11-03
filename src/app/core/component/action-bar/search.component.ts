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
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'opentosca-search',
    styles: [
        'form { padding-left: 0; }'
    ],
    template: `
        <div class="mr-sm-2">
            <input
                    type="text"
                    class="form-control"
                    [placeholder]="placeholder"
                    opentoscaDebounce
                    (debouncedValue)="valueChanged($event)">
        </div>
    `
})
export class SearchComponent {

    @Input()
    public placeholder = '';

    @Output()
    searchTermChanged: EventEmitter<string> = new EventEmitter<string>();

    public valueChanged(searchTerm: string): void {
        console.log('[search.component] Search value changed:', searchTerm);
        this.searchTermChanged.emit(searchTerm);
    }
}
