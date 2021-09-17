import { ResourceSupport } from '../../core/model/resource-support.model';

export class AggregatedSituation extends ResourceSupport {
    id: string;
    situation_ids: Array<string>;
    logic_expression: string;
    active: string;
}
