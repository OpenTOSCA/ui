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

import { ResourceSupport } from './resource-support.model';
import { PlanParameter } from './plan-parameter.model';
import { logging } from 'selenium-webdriver';

export class Plan extends ResourceSupport {
    id: string;
    plan_type: string;
    plan_language: string;
    input_parameters: Array<PlanParameter>;
    output_parameters: Array<PlanParameter>;
    plan_model_reference: string;
    calculated_wcet: number;
}
