/*
 * Copyright (c) 2019 University of Stuttgart.
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
export class PlacementStatus {
    possible: boolean;
    location: string;
    csarId: string;
}

export interface PlacementCandidate {
    placement_matches: PlacementMatch[];
    alternative_matches: AlternativeMatch[];
}

export interface PlacementMatch {
    cpb_node: CpbNode;
    tbp_node: TbpNode;
    match_id: string;
}

export interface AlternativeMatch {
    cpb_node: CpbNode;
    tbp_node: TbpNode;
    match_id: string;
}

export interface TbpNode {
    to_be_placed_node: string;
    node_type_of_to_be_placed_node: string;
    service_template_of_to_be_placed_node: string;
    csar_id_of_to_be_placed_node: string;
    reqs_of_to_be_placed_node: string[];
    property_map: PropertyMap;
}

export interface CpbNode {
    os_node: string;
    node_type_of_os_node: string;
    service_template_of_os_node: string;
    csar_id_of_os_node: string;
    caps_of_osnode: string[];
    instance_idof_osnode: number;
    instance_idof_service_template_of_os_node: number;
    property_map: PropertyMap;
}

export interface PropertyMap {
    [key: string]: string;
}
