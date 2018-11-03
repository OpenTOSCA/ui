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

export class PlanInstance extends ResourceSupport {
    id: string;
    state: string;
    output: Array<PlanParameter>;
    logs: Array<PlanLogEntry>;
}
