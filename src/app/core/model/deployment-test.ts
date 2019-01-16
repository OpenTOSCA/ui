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

export class DeploymentTest {
    timestamp: number;
    state: string;
    deployment_test_results: Array<DeploymentTestResult>;
    statistics: {
        total: number;
        success: number;
        failed: number;
        unknown: number;
    };
}

export class DeploymentTestResult {
    name: string;
    start: number;
    end: number;
    state: string;
    output: string;
    node_template_instance: {
        id: number;
        template_id: string;
        template_type: string;
        name: string;
    };

    get duration(): number {
        return this.end - this.start;
    }
}
