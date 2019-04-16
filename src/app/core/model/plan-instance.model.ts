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
import { PlanLogEntry } from './plan-log-entry.model';
import { PlanInstanceState } from './plan-instance-state.model';

export class PlanInstance extends ResourceSupport {
    service_template_instance_id: string;
    correlation_id: string;
    state: PlanInstanceState;
    type: 'BUILD' | 'MANAGEMENT' | 'TERMINATION' | 'TRANSFORMATION' | 'OTHER';
    outputs: Array<PlanParameter>;
    logs: Array<PlanLogEntry>;
}
