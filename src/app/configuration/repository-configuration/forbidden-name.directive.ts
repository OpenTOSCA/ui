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
import { Directive, Input, OnInit } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';

export function forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        let value: string = control.value;
        if (value === null || value === undefined) {
            value = '';
        }
        return value.trim() === 'OpenTOSCA' ? { 'forbiddenName': { value: control.value } } : null;
    };
}

@Directive({
    selector: '[opentoscaForbiddenName]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenNameValidatorDirective, multi: true }]
})
export class ForbiddenNameValidatorDirective implements Validator, OnInit {

    @Input() ngModel;

    private value: string;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.value !== 'OpenTOSCA' ? forbiddenNameValidator()(control) : null;
    }

    ngOnInit(): void {
        this.value = this.ngModel;
    }
}
