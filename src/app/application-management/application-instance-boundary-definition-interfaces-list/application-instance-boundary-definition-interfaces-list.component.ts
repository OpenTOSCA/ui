import { Component, Input, OnInit } from '@angular/core';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';
import { Plan } from '../../core/model/plan.model';
import { Interface } from '../../core/model/interface.model';
import { ApplicationInstanceManagementService } from '../../core/service/application-instance-management.service';
import { Operation } from '../../core/model/operation.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'opentosca-application-instance-boundary-definition-interfaces-list',
    templateUrl: './application-instance-boundary-definition-interfaces-list.component.html',
    styleUrls: ['./application-instance-boundary-definition-interfaces-list.component.scss']
})
export class ApplicationInstanceBoundaryDefinitionInterfacesListComponent implements OnInit {

    @Input()
    instance: ServiceTemplateInstance;

    interfaces: Array<Interface>;

    plan: Plan;
    dialogVisible = false;

    rowGroupMetadata: any;

    columns = [
        {field: '', header: 'Interface'},
        {field: '', header: 'Operation'},
        {field: '', header: 'Type'},
        {field: '', header: 'Reference'},
        {field: '', header: ''},
    ];

    constructor(private appInstanceService: ApplicationInstanceManagementService) {
    }

    ngOnInit() {
        this.appInstanceService.getInterfaces(this.instance)
            .subscribe(interfaces => {
                this.interfaces = interfaces;
                this.updateRowGroupMetaData();
            });
    }

    showDialog(plan: Plan): void {
        this.plan = plan;
        this.dialogVisible = true;
    }

    updateRowGroupMetaData() {
        this.rowGroupMetadata = {};
        if (this.interfaces) {
            for (let i = 0; i < this.interfaces.length; i++) {
                let rowData = this.interfaces[i];
                let name = rowData.name;
                if (i == 0) {
                    this.rowGroupMetadata[name] = { index: 0, size: 1 };
                }
                else {
                    let previousRowData = this.interfaces[i - 1];
                    let previousRowGroup = previousRowData.name;
                    if (name === previousRowGroup)
                        this.rowGroupMetadata[name].size++;
                    else
                        this.rowGroupMetadata[name] = { index: i, size: 1 };
                }
            }
        }
    }

}
