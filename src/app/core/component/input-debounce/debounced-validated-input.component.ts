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
import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'opentosca-debounced-validated-input',
    template: `
        <div
                class="form-group has-feedback"
                [ngClass]="{
                    'has-success': inputValidated && inputValid,
                    'has-danger': inputValidated && !inputValid
                }">
            <input
                    type="text"
                    class="form-control"
                    [placeholder]="placeholder"
                    opentoscaDebounce
                    (debouncedValue)="updateAndValidate($event)"
                    [ngClass]="{
                        'form-control-success': inputValidated && inputValid,
                        'form-control-danger': inputValidated && !inputValid
                    }">
        </div>
    `
})
export class DebouncedValidatedInputComponent {

    @Input()
    placeholder: string;

    @Input()
    validator: (value: string) => Observable<boolean>;

    @Output()
    valueChange: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    validityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    inputValidated = false;
    inputValid = false;

    constructor(private elementRef: ElementRef, private http: HttpClient) {
    }

    updateAndValidate(value: string): void {
        if (this.validator && value) {
            this.validator(value).subscribe(valid => {
                this.validityChange.emit(valid);
                this.inputValid = valid;
                this.inputValidated = true;
            });
        } else {
            this.inputValidated = false;
        }
        this.valueChange.emit(value);
    }
}
