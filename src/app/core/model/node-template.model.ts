import { InterfaceList } from './interface-list.model';
import { Property } from './property.model';

export class NodeTemplate {
    id: string;
    name: string;
    interfaces: InterfaceList;
    node_type: string;
    properties: Property[];
}
