/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Wurster - initial implementation
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'opentosca-ui-search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.scss']
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
