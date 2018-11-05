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
import { PlanParameter } from '../model/plan-parameter.model';
import * as _ from 'lodash';

@Pipe({ name: 'filterOutputParams' })
export class FilterOutputParams implements PipeTransform {

    transform(params: Array<PlanParameter>, blacklist: Array<string>): any {
        return params.filter((param) => !_.includes(blacklist, param.name));
    }
}
