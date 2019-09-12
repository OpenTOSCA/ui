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

import { ServiceTemplateListEntry } from './service-template-list-entry.model';
import { ResourceSupport } from './resource-support.model';
import { InterfaceList } from './interface-list.model';

/**
 * Class that reflects ServiceTemplateInstanceTopologies ressource provided by API
 */
export class ServiceTemplateInstanceTopology extends ResourceSupport {
    node_template_instances_list: NodeTemplateInstancesList;
    relationship_template_instances_list: RelationshipTemplateInstancesList;
}

export class NodeTemplateInstancesList extends ResourceSupport {
    service_template_instance_topologies: Array<NodeTemplateInstance>;
}

// export class NodeTemplateInstances extends ResourceSupport {
//     service_template_instance_topologies: Array<NodeTemplateInstance>;
// }

export class NodeTemplateInstance extends ResourceSupport {
    id: number;
    node_template_id: string;
    node_template_type: string;
    state: string;
    created_at: string;
    csar_id: string;
    service_template_instance_id: number;
    service_template_id: string;
    properties: any;
    interfaces: InterfaceList;
}

export class RelationshipTemplateInstancesList extends ResourceSupport {
    relationship_template_instances: Array<RelationshipTemplateInstance>;
}

// export class RelationshipTemplateInstances extends ResourceSupport {
//     relationship_template_instances: Array<RelationshipTemplateInstance>;
// }

export class RelationshipTemplateInstance extends ResourceSupport {
    id: number;
    relationship_template_id: string;
    relationship_template_type: string;
    state: string;
    created_at: string;
    csar_id: string;
    service_template_id: string;
    source_node_template_instance_id: string;
    target_node_template_instance_id: string;
}
