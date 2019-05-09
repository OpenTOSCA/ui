import { Component, Input, OnInit } from '@angular/core';
import { PlanInstance } from '../../core/model/plan-instance.model';
import { globals } from '../../globals';

@Component({
    selector: 'opentosca-management-plan-instance-list',
    templateUrl: './management-plan-instance-list.component.html',
    styleUrls: ['./management-plan-instance-list.component.scss']
})
export class ManagementPlanInstanceListComponent implements OnInit {

    @Input() planInstances: Array<PlanInstance>;

    outputParamCols = [
        {field: 'name', header: 'Name'},
        {field: 'value', header: 'Value'}
    ];

    logColumns = [
        {field: 'start_timestamp', header: 'Start Timestamp'},
        {field: 'end_timestamp', header: 'End Timestamp'},
        {field: 'status', header: 'Type'},
        {field: 'message', header: 'Message'}
    ];

    constructor() {
    }


    get hiddenElements(): Array<String> {
        return globals.hiddenElements;
    }

    ngOnInit() {
    }

}
