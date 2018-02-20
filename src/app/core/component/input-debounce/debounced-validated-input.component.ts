/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Tobias Wältken
 */
import { Http } from '@angular/http';
import { async } from '@angular/core/testing/src/testing';

import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';


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
                    opentosca-debounce
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
    validator: (value: string) => Observable<boolean>

    @Output()
    valueChange: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    validityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    inputValidated = false;
    inputValid = false;

    constructor(private elementRef: ElementRef, private http: Http) {
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
