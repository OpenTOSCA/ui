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

import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Directive({
    selector: '[opentoscaDebounce]',
    host: {
        '(input)': 'inputValue = $event.target.value'
    }
})
export class DebounceDirective {

    static readonly DEFAULT_DELAY = 300;

    @Input('opentoscaDebounce')
    delay?: number;

    @Output()
    debouncedValue: EventEmitter<string> = new EventEmitter<string>();

    inputValue: string;

    constructor(private elementRef: ElementRef, private http: HttpClient) {
        fromEvent(elementRef.nativeElement, 'keyup')
            .pipe(
                map(() => this.inputValue),
                debounceTime(this.delay ? this.delay : DebounceDirective.DEFAULT_DELAY),
                distinctUntilChanged()
            )
            .subscribe(input => {
                this.debouncedValue.emit(input);
            });
    }
}
