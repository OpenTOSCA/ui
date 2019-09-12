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
import { NodeOperationParameter } from './node-operation-parameter.model';

export class NodeOperationInterface extends ResourceSupport {
    csarID: string;
    serviceTemplateID: string;
    serviceInstanceID: string;
    nodeTemplateID: string;
    node_instance_id: string;
    node_instance_properties: any;
    name: string;
    node_operations: NodeOperationAttributes[] = [];

    public NodeOperationInterface() {

    }
}

export class NodeOperationAttributes {
    input_parameters: NodeOperationParameter[];
    name: string;
    output_parameters: NodeOperationParameter[];
}
