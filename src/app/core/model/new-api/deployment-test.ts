/**
 * Copyright (c) 2018 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Wurster - initial implementation
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
