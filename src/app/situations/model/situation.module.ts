import { ResourceSupport } from '../../core/model/resource-support.model';

export class Situation extends ResourceSupport {
    id: string;
    situation_template_id: string;
    active: string;
    thing_id: string;
}
