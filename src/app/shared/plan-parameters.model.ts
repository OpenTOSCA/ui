import {PlanParameter} from "./plan-parameter.model";
/**
 * Created by Michael Falkenthal on 27.10.16.
 */
export class PlanParameters {
    public ID: string;
    public Name: string;
    public PlanType: string;
    public PlanLanguage: string;
    public InputParameters: {InputParameter: PlanParameter}[];
    public OutputParameters: {OutputParameter: PlanParameter}[];
    public PlanModelReference: {Reference: string};
}