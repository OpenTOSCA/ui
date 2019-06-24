import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationManagementService } from '../../core/service/application-management.service';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/app-state.model';
import { PlacementCandidate, PlacementMatch } from '../../core/model/placement.model';
import { LoggerService } from '../../core/service/logger.service';
import { GrowlActions } from '../../core/growl/growl-actions';
import { Csar } from '../../core/model/csar.model';

@Component({
    selector: 'opentosca-placement-dialog',
    templateUrl: './placement-dialog.component.html',
    styleUrls: ['./placement-dialog.component.css']
})
export class PlacementDialogComponent implements OnInit {

    @Input() visible = false;
    @Input() csar: Csar;
    @Output() visibleChange = new EventEmitter<boolean>();
    placementInProgress = false;
    waitingForCompletion = false;
    placementCandidateExists = false;
    placementCandidateIsSet = false;
    csarGotCompletedSuccessfully = false;
    mapOfPossiblePlacements = new Map<string, Array<any>>();
    applicationName: string;
    completedCsarUrl: string;
    csarDownloadUrl: string;
    selectedPlacement: Array<PlacementMatch> = [];

    constructor(private appService: ApplicationManagementService,
                private ngRedux: NgRedux<AppState>,
                private logger: LoggerService) {
    }

    ngOnInit() {
        this.applicationName = this.ngRedux.getState().container.application.csar.name;
    }

    getContainerUrl(): string {
        return this.ngRedux.getState().administration.containerUrl;
    }

    onChangeSelection(selection) {
        if (this.selectedPlacement.length === this.mapOfPossiblePlacements.size) {
            this.placementCandidateIsSet = true;
        }
    }

    createDeployableCSARfromCandidate() {
        this.waitingForCompletion = true;
        this.appService.createDeployableCSARfromCandidate(this.selectedPlacement, this.csar).subscribe(res => {
            console.log(res);
            this.completedCsarUrl = res;
            this.csarDownloadUrl = res + '/?csar';
            this.waitingForCompletion = false;
            this.csarGotCompletedSuccessfully = true;

            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'success',
                    summary: 'Placement Completion was successful',
                    detail: 'Find links to the old/new ServiceTemplate and CSAR in the modal.'
                }
            ));
        }, err => {
            console.log(err);
        });
    }

    /**
     * Closes the modal and emits change event.
     */
    closeModal(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    runPlacementOperation() {
        // this.visible = false;
        this.ngRedux.dispatch(GrowlActions.addGrowl(
            {
                severity: 'info',
                summary: 'Placement Operation Started',
                detail: 'The placement algorithm is searching for suitable candidates...'
            }
        ));
        this.placementInProgress = true;
        this.appService.initiatePlacementOperation(this.csar).subscribe((placementCandidate: PlacementCandidate) => {
            this.logger.log(
                '[placement-dialog][run placement operation]',
                'Received result.'
            );
            this.placementInProgress = false;
            this.placementCandidateExists = true;
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'success',
                    summary: 'Placement Candidate Found',
                    detail: 'The placement algorithm returned a candidate.'
                }
            ));

            placementCandidate.placement_matches.map(match => {
                console.log('real matches: ');
                console.log(match.match_id);
                // Set guarantees that only unique values get added
                const possiblePlacements = new Set();
                // put the recommended placement location in first
                possiblePlacements.add({
                    tbpNode: match.tbp_node,
                    cpbNode: match.cpb_node,
                    matchId: match.match_id
                });
                // followed by the alternative options
                placementCandidate.alternative_matches.map(alt => {
                    console.log('alt matches: ');
                    console.log(alt.match_id);
                    if (alt.tbp_node.to_be_placed_node === match.tbp_node.to_be_placed_node) {
                        possiblePlacements.add({
                            tbpNode: alt.tbp_node,
                            cpbNode: alt.cpb_node,
                            matchId: match.match_id
                        });
                    }
                });
                // add to array of possible placements
                this.mapOfPossiblePlacements.set(match.tbp_node.to_be_placed_node, Array.from(possiblePlacements));
            });
        }, err => {
            this.logger.handleError('[placement-dialog][run placement operation]', err);
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Failure at Placement Operation',
                    detail: 'The placement algorithm was unsuccessful.'
                }
            ));
        });
    }

}
