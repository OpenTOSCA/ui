import { ResourceSupport } from '../../core/model/resource-support.model';
import { Situation } from './situation.module';
import { PlanParameter } from '../../core/model/plan-parameter.model';


export class SituationTrigger extends ResourceSupport {
    id: string;
    situation_ids: Array<string>;
    service_instance_id: string;
    aggregated_situation_ids: Array<string>;
    csar_id: string;
    on_activation: string;
    single_instance: string;
    interface_name: string;
    operation_name: string;
    input_params: Array<PlanParameter>;
}
