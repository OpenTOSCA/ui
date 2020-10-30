/*
 * Copyright (c) 2018 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */
import { Component, OnInit } from '@angular/core';
import { AppState } from './../store/app-state.model';
import { NgRedux} from '@angular-redux/store';
import { GrowlActions } from './../core/growl/growl-actions';
import { filter } from 'lodash';


@Component({
  selector: 'opentosca-situation',
  templateUrl: './situation.component.html',
  styleUrls: ['./situation.component.scss'],
})

/**
 * This class contains the feedback (confirmation and error messages) for the UI.
 * 
 * 
 * 
 * @author Lavinia Stiliadou
 */
export class FeedbackComponent implements OnInit {

  ngOnInit(): void {}

  constructor(private ngRedux: NgRedux<AppState>) { }

  /**
   * Confirmation messages
   * @param typeOfRequest @POST / @DELETE / @PUT
   */
  onCompletionSuccess(typeOfRequest: string) {
    let filterRequest = typeOfRequest.split(',');
    if (typeOfRequest === 'post') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Creation of situation ',
          detail: `The situation is successfully created.`
        }
      ));
    } else if (filterRequest[1] === 'D') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Delete of situation ' + filterRequest[0],
          detail: `The aggregated situations and the situationtriggers which contains the situation and the situation are successfully deleted.`
        }
      ));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Update of situation ' + filterRequest[0],
          detail: `The situation is successfully updated.`
        }
      ));
    }

  }

  /**
   * Error messages
   * @param typeOfRequest @POST / activateTrigger / @DELETE / @PUT
   */
  onCompletionError(typeOfRequest: string): void {
    let filterRequest = typeOfRequest.split(',');
    if (typeOfRequest === 'post') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Error at creation of situation',
          detail: `The situation is not created.`
        }
      ));
    } else if (typeOfRequest === 'activate') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Error',
          detail: 'The active attribute of the situation trigger and of it is situations and aggregated situations are not corresponding.'
        }
      ));
    } else if (filterRequest[1] === 'D') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Error at delete of situation',
          detail: 'The aggregated situations which contains the situation and the situation are not deleted.'
        }
      ));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Error at update of situation' + typeOfRequest,
          detail: `The situation is not updated.`
        }
      ));
    }
  }

	/**
   * Error messages if the input is invalid
   * @param failedInput 
   */
  failedSituationTextInput(failedInput: string) {
    if (failedInput === 'Active') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' must be false or true.'
        }));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' can not be empty.'
        }));
    }
  }

  /**
   * Confirmation messages
   * @param typeOfRequest @POST / @DELETE / @PUT
   */
  onCompletionSuccessAggregatedSituation(typeOfRequest: string) {
    let filterRequest = typeOfRequest.split(',');
    if (typeOfRequest === 'post') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Creation of a aggregated situation ',
          detail: `The aggregated situation is successfully created.`
        }
      ));
    } else if (filterRequest[1] === 'D') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Delete of aggregated situation ' + filterRequest[0],
          detail: `The aggregated situation is successfully deleted and the corresponding situationtriggers are deleted.`
        }
      ));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Update of aggregated situation ' + filterRequest[0],
          detail: `The aggregated situation is successfully updated.`
        }
      ));
    }
  }

  /**
   * Error messages
   * @param typeOfRequest @POST
   */
  onCompletionErrorAggregatedSituation(typeOfRequest: string) {
    let filterRequest = typeOfRequest.split(',');
    if (typeOfRequest === 'post') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Creation of aggregation situation failed',
          detail: `The aggregated situation is not created.`
        }
      ));
    } else if (filterRequest[1] === 'D') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Delete of aggregation situation ' + filterRequest[0] + ' failed.',
          detail: `The aggregated situation is not deleted.`
        }
      ));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Update of aggregation situation ' + filterRequest[0] + ' failed.',
          detail: `The aggregated situation is not updated.`
        }
      ));
    }
  }

  /**
   * Error messages if the input is invalid.
   * @param failedInput 
   */
  failedAggregatedSituationTextInput(failedInput: string) {
    if (failedInput === 'Expression') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' does not correspond to the scheme NumberOperatorNumber.'
        }));
    } else if (failedInput === 'ExpressionSit') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' contains situation ids which are not in situation ids.'
        }));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' contains some unknown situation ids.'
        }));
    }
  }

  /**
  * Error messages
  * @param typeOfRequest @POST / @DELETE 
  */
  onCompletionErrorTrigger(typeOfRequest: string) {
    let filterRequest = typeOfRequest.split(',');
    if (typeOfRequest === 'post') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Creation of situationtrigger failed',
          detail: `The situationtrigger is not created.`
        }
      ));
    } else if (filterRequest[1] === 'C') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Activation of situationtrigger failed',
          detail: `The situationtrigger is not started because the CSAR ` + filterRequest[0] + ' not exists.'
        }
      ));
    } else if (filterRequest[1] === 'I') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Activation of situationtrigger failed',
          detail: `The situationtrigger is not started because the Interface ` + filterRequest[0] + ' not exists.'
        }
      ));
    } else if ( filterRequest[1] === 'D'){
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Delete of situationtrigger ' + filterRequest[0]+' failed',
          detail: `The situationtrigger is not deleted.`
        }
      ));
    }else{
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Execution of plan failed',
          detail: 'The plan ' + filterRequest[0]+ ' is not executed.'
        }
      ));
    }
  }

  /**
   * Confirmation messages
   * @param typeOfRequest @POST / @DELETE
   */
  onCompletionSuccessTrigger(typeOfRequest: string) {
    if (typeOfRequest === 'post') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Creation of situationtrigger',
          detail: `The situationtrigger is successfully created.`
        }
      ));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'success',
          summary: 'Delete of situationtrigger',
          detail: `The situationtrigger is successfully deleted.`
        }
      ));
    }
  }

  /**
  * Error messages if the input is invalid
  * @param failedInput 
  */
  failedSituationTriggerTextInput(failedInput: string) {
    let filterInput = failedInput.split(',');
    if (failedInput === 'Active' || failedInput === 'Single Instance') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' must be false or true.'
        }));
    } else if (filterInput[1] === 'O') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Creation of situationtrigger failed',
          detail: 'The operation ' + filterInput[0] + ' not exists for the given interface.'
        }
      ));
    } else if (failedInput === 'Situation IDs' || failedInput === 'Aggregated Situation IDs') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: 'Some ' + failedInput + ' are unknown'
        }));
    } else if (failedInput === 'Empty') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid Input',
          detail: 'The Id of the situations and aggregated situations can never be empty at the same time.'
        }));
    } else if (failedInput === 'Value') {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Error',
          detail: `The value of an input parameter can not be empty.`
        }
      ));
    } else {
      this.ngRedux.dispatch(GrowlActions.addGrowl(
        {
          severity: 'error',
          summary: 'Invalid ' + failedInput,
          detail: failedInput + ' can not be empty.'
        }));
    }
  }


}