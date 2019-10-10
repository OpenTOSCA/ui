import { NodeTemplate } from './node-template.model';
import { NodeTemplateInstance } from './node-template-instance.model';

export class PlacementNodeTemplate extends NodeTemplate {
    valid_node_template_instances: NodeTemplateInstance[];
}
