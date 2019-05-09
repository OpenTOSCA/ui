import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { LoggerService } from '../../core/service/logger.service';
import { GrowlActions } from '../../core/growl/growl-actions';
import { Csar } from '../../core/model/csar.model';

@Component({
    selector: 'opentosca-placement-dialog',
    templateUrl: './placement-dialog.component.html',
    styleUrls: ['./placement-dialog.component.scss']
})
export class PlacementDialogComponent implements OnInit {

    @Input() visible = false;
    @Input() csar: Csar;
    @Output() visibleChange = new EventEmitter<boolean>();

    constructor(private appService: ApplicationManagementService,
                private ngRedux: NgRedux<AppState>,
                private logger: LoggerService) {
    }

    ngOnInit() {

    }

    /**
     * Closes the modal and emits change event.
     */
    closeModal(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        console.log(this.csar)
    }

    runPlacementOperation() {
        this.visible = false;
        this.appService.initiatePlacementOperation("").subscribe(() => {
            this.logger.log(
                '[management-plan-execution-dialog][run placement]',
                'Received result after post ' + JSON.stringify(location)
            );
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'info',
                    summary: 'Placement Operation Started',
                    detail: 'The placement algorithm is searching for suitable candidates.'
                }
            ));
        }, err => {
            this.logger.handleError('[management-plan-execution-dialog][run placement]', err);
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Failure at Placement Operation Started',
                    detail: 'The placement algorithm was unsuccessful.'
                }
            ));
        });
    }

}
