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
import { ApplicationManagementService } from './../core/service/application-management.service';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { BreadcrumbActions } from './../core/component/breadcrumb/breadcrumb-actions';
import { AppState } from './../store/app-state.model';
import { NgRedux, select } from '@angular-redux/store';
import { HttpClient } from '@angular/common/http';
import { Situation } from './model/situation.module';
import { SituationTrigger } from './model/situationtrigger.module';
import { AggregatedSituation } from './model/agggregatedSituation.module';
import { PlanParameter } from './../core/model/plan-parameter.model';
import { Item } from './../configuration/repository-configuration/repository-configuration.component';
import { FunctionComponent } from './function.component';
import { FeedbackComponent } from './feedback.component';
import { Plan } from '../core/model/plan.model';


@Component({
  selector: 'opentosca-situation',
  templateUrl: './situation.component.html',
  styleUrls: ['./situation.component.scss'],
})

/**
 * This class contains the management of situations, aggregated situations and situation triggers. It also contains the
 * situational execution of management plans.
 * 
 * ! Note that a new version of the container must be used because aggregated situations did not exist.
 * 
 * @author Lavinia Stiliadou
 */
export class SituationComponent implements OnInit {

  // select the containerURL from the administration component
  @select(['administration', 'containerUrl']) administrationItems$: Observable<Array<Item>>;

  administrationItems: Array<Item> = [];
  selectedRepository: string;

  public instanceId: string;

  fc = new FunctionComponent();
  feedback: FeedbackComponent;
  situations: Array<Situation>;
  situationtriggers: Array<SituationTrigger>;
  aggregatedSituations = new Array<AggregatedSituation>();

  cols;
  colsOfTriggers;
  colsOfAggregatedSituations;

  /**
   * The constructor of the class.
   * 
   * @param ngRedux to dispatch the feedback 
   * @param http for the communication with the Situation API
   * @param appService to access the normal execution of management plans
   */
  constructor(private ngRedux: NgRedux<AppState>, private http: HttpClient, private appService: ApplicationManagementService) { }

  /**
   * Initialize the table for situations, aggregated situations and situationtriggers.
   */
  ngOnInit(): void {

    this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
      { label: 'Situation', routerLink: ['/situation'] }
    ]));

    this.administrationItems$.subscribe(items => { let temp = ""; this.administrationItems = items; temp = temp + items });

    // sets the selectedRepository to the API Endpoint
    this.selectedRepository = this.administrationItems + "/situationsapi";

    // situation table columns
    this.cols = [
      { field: 'id', header: 'Situation ID', sortable: true },
      { field: 'situation_template_id', header: 'Situation Template ID', sortable: true },
      { field: 'active', header: 'active', sortable: true },
      { field: 'thing_id', header: 'Thing ID', sortable: true },
      { field: 'actions', header: 'actions', sortable: false }
    ];

    // aggregated situation table columns
    this.colsOfAggregatedSituations = [
      { field: 'id', header: 'Aggregated Situation ID', sortable: true },
      { field: 'situation_ids', header: 'Situation IDs', sortable: true },
      { field: 'logic_expression', header: 'Logic Expression', sortable: true },
      { field: 'active', header: 'active', sortable: true },
      { field: 'actions', header: 'actions', sortable: false }
    ];

    // situationtrigger table columns
    this.colsOfTriggers = [
      { field: 'id', header: 'Trigger ID', sortable: true },
      { field: 'situation_ids', header: 'Situation IDs', sortable: true },
      { field: 'aggregated_situation_ids', header: 'Aggregated Situation IDs', sortable: true },
      { field: 'csar_id', header: 'CSAR ID', sortable: true },
      { field: 'on_activation', header: 'active', sortable: true },
      { field: 'interface_name', header: 'Interface Name', sortable: true },
      { field: 'operation_name', header: 'Operation Name', sortable: true },
      { field: 'input_params', header: 'Input Parameter', sortable: true },
      { field: 'single_instance', header: 'Single Instance', sortable: true },
      { field: 'actions', header: 'actions', sortable: false }
    ];

    this.feedback = new FeedbackComponent(this.ngRedux);
    this.refresh();
  }

  /**
   * Sends multiple @GET requests to the Situation API
   */
  refresh(): void {
    this.refreshSituations();
    this.refreshAggrSituations();
    this.refreshTriggers();

    this.situations = new Array<Situation>();
    this.situationtriggers = new Array<SituationTrigger>();
    this.aggregatedSituations = new Array<AggregatedSituation>();
  }

  // situations  

  /**
   * Sends a @GET requests to the Situation API.
   */
  refreshSituations(): void {
    let situations = this.http.get(this.selectedRepository + '/situations', { responseType: 'text' });
    situations.subscribe(response => this.editGetResponseSituations(response));
  }

  /**
   * Format the @GET response and adds the situations from the API to the table.
   * @param jsonText 
   */
  editGetResponseSituations(jsonText: string): void {
    this.situations = this.fc.editGetResponseSituations(jsonText);
  }

  /**
   * Takes the value of the situation text fields. If all entries are valid, a @POST request is made to the API.
   */
  getTextInputSituation(): void {
    let situation = this.fc.getTextInputSituation();
    let result = this.fc.checkTextInput();
    if (result === 'ok') {
      this.postSituation(situation);
      this.reset();
    } else {
      this.failedSituationTextInput(result);
      this.reset();
    }
  }

  /**
   * Sends a @POST request to the API to create a new situation.
   * @param situation 
   */
  postSituation(situation: Situation): void {
    let post = this.http.post(this.selectedRepository + '/situations', {
      situation_template_id: situation.situation_template_id,
      thing_id: situation.thing_id,
      active: situation.active
    });

    post.subscribe(() => { this.onCompletionSuccess('post'); this.refresh() },
      () => { this.onCompletionError('post'); this.refresh() });
  }

  /**
   * Sends a @PUT request to the API to activate/deactivate a situation with the given id.
   * 
   * @param id 
   */
  putSituation(id: string): void {
    let active = this.fc.switchActive(id);
    let put = this.http.put(this.selectedRepository + '/situations/' + id.toString(), {
      id: id,
      active: active
    }, { responseType: 'text' });
    put.subscribe(() => {
      this.onCompletionSuccess(id + ',P'); this.refresh();
    }, () => {
      this.onCompletionError(id + ',P'); this.refresh();
    });
  }

  /**
   * Deletes the situation with the given id.
   * 
   * @param id
   */
  deleteSituation(id: string): void {
    let deleteRequest = this.http.delete(this.selectedRepository + '/situations/' + id, {});
    deleteRequest.subscribe(() => { this.onCompletionSuccess(id + ',D'); this.refresh() },
      err => this.onCompletionError(id + ',D'));
  }

  /**
   * Deletes all situations.
   */
  deleteAllSituations(): void {
    let arrayOfSituationIds: string[] = new Array();
    this.situations.forEach(function (value) {
      arrayOfSituationIds.push(value.id);
    })
    for (let i = 0; i < arrayOfSituationIds.length; i++) {
      let id = arrayOfSituationIds[i];
      this.deleteSituation(id);
    }
  }

  /**
   * Confirmation messages
   * @param typeOfRequest @POST / @DELETE / @PUT
   */
  onCompletionSuccess(typeOfRequest: string) {
    this.feedback.onCompletionSuccess(typeOfRequest);
  }

  /**
   * Error messages
   * @param typeOfRequest @POST / activateTrigger / @DELETE / @PUT
   */
  onCompletionError(typeOfRequest: string): void {
    this.feedback.onCompletionError(typeOfRequest);
  }

  /**
   * Resets all text fields.
   */
  reset(): void {
    this.fc.reset();
  }

  /**
   * Error messages if the input is invalid.
   * @param failedInput 
   */
  failedSituationTextInput(failedInput: string) {
    this.feedback.failedSituationTextInput(failedInput);
  }

  // aggregated situations

  /**
   * Sends a @GET request to the Situation API to get all aggregated situations.
   */
  refreshAggrSituations(): void {
    let aggrSituations = this.http.get(this.selectedRepository + '/aggregatedsituations', { responseType: 'text' });
    aggrSituations.subscribe(response => this.editGetResponseAggregatedSituations(response));
  }

  /**
   * Format the @GET response and adds the aggregated situations from the API to the table.
   * @param jsonText 
   */
  editGetResponseAggregatedSituations(jsonText: string): void {
    this.aggregatedSituations = this.fc.editGetResponseAggregatedSituations(jsonText);
  }

  /**
   * Takes the value of the aggregated situation text fields. If all entries are valid, a @POST request is made to the API.
   */
  getTextInputAggregatedSituation(): void {
    let aggregatedsituation = this.fc.getTextInputAggregatedSituation();
    let result = this.fc.checkTextInputAggregatedSituation(this.situations);
    if (result === 'ok') {
      this.postAggregatedSituation(aggregatedsituation);
      this.reset();
    } else {
      this.failedAggregatedSituationTextInput(result);
      this.reset();
    }
  }

  /**
   * To edit a aggregated situation.
   * @param instanceId id of the aggregated situation
   */
  editInstance(instanceId: string) {
    this.fc.editInstance(instanceId);
  }

  /**
   * Sends a @PUT request to update the aggregated situation.
   */
  applyTable() {
    let aggregatedSituation = this.fc.applyTable(this.situations);
    if(typeof aggregatedSituation !== 'undefined'){
      this.putAggregatedSituation(aggregatedSituation);
      this.reset();
    }else{
      let id = (<HTMLInputElement> document.getElementById('aggregateSituation_id')).value;
      this.onCompletionErrorAggregatedSituation(id+',P');
      this.reset();
    }
  }

  /**
   * Sends a @PUT request to the API to activate/deactivate the given aggregated situation.
   * 
   * @param aggregatedSituation
   */
  putAggregatedSituation(aggregatedSituation: AggregatedSituation) {
    let put = this.http.put(this.selectedRepository + '/aggregatedsituations/' + aggregatedSituation.id, {
      id: aggregatedSituation.id,
      situation_ids: aggregatedSituation.situation_ids,
      logic_expression: aggregatedSituation.logic_expression
    }, { responseType: 'text' });
    put.subscribe(() => {
      this.onCompletionSuccessAggregatedSituation(aggregatedSituation.id + ',P'); this.refresh();
    }, err => {
      this.onCompletionErrorAggregatedSituation(aggregatedSituation.id + ',P'); this.refresh();
    });
  }

  /**
   * Deletes the aggregated situation with the given id.
   * 
   * @param id
   */
  deleteAggregatedSituation(id: string): void {
    let deleteRequest = this.http.delete(this.selectedRepository + '/aggregatedsituations/' + id, {
    });
    deleteRequest.subscribe(() => { this.onCompletionSuccessAggregatedSituation(id + ',D'); this.refresh() },
      err => { this.onCompletionErrorAggregatedSituation(id + ',D'); this.refresh(); })
  }

  /**
   * Deletes all aggregated situations.
   */
  deleteAllAggregatedSituations(): void {
    let arrayOfAggregatedSituationIds: string[] = new Array();
    this.aggregatedSituations.forEach(function (value) {
      arrayOfAggregatedSituationIds.push(value.id);
    })
    for (let i = 0; i < arrayOfAggregatedSituationIds.length; i++) {
      let id = arrayOfAggregatedSituationIds[i];
      this.deleteAggregatedSituation(id);
    }
  }

  /**
   * Sends a @POST request to the API to create a new aggregated situation.
   * @param aggregatedSituation 
   */
  postAggregatedSituation(aggregatedSituation: AggregatedSituation): void {
    let result = aggregatedSituation.situation_ids;
    let post = this.http.post(this.selectedRepository + '/aggregatedsituations', {
      situation_ids: result,
      logic_expression: aggregatedSituation.logic_expression,
      active: false
    });
    post.subscribe(() => { this.onCompletionSuccessAggregatedSituation('post'); this.refresh() },
      err => this.onCompletionErrorAggregatedSituation('post'));
  }

  /**
   * Confirmation messages
   * @param typeOfRequest @POST / @DELETE / @PUT
   */
  onCompletionSuccessAggregatedSituation(typeOfRequest: string) {
    this.feedback.onCompletionSuccessAggregatedSituation(typeOfRequest);
  }

  /**
   * Error messages
   * @param typeOfRequest @POST
   */
  onCompletionErrorAggregatedSituation(typeOfRequest: string) {
    this.feedback.onCompletionErrorAggregatedSituation(typeOfRequest);
  }

  /**
   * Error messages if the input is invalid.
   * @param failedInput 
   */
  failedAggregatedSituationTextInput(failedInput: string) {
    this.feedback.failedAggregatedSituationTextInput(failedInput);
  }

  // situationtriggers

  /**
   * Sends a @GET request to the Situation API to get all triggers.
   */
  refreshTriggers(): void {
    let triggers = this.http.get(this.selectedRepository + '/triggers', { responseType: 'text' });
    triggers.subscribe(response2 => this.editGetResponseTriggers(response2));
  }
  
  /**
   * Format the @GET response and adds the situationtrigger from the API to the table.
   * @param jsonText 
   */
  editGetResponseTriggers(jsonText: string): void {
    this.situationtriggers = this.fc.editGetResponseTriggers(jsonText);
  }

  /**
   * Adds all installed CSARs in the API to the select box
   */
  onchangeCSAR() {
    let combibox = <HTMLSelectElement>document.getElementById('csar_combobox');
    let containsCSAR;
    let csarRepo = this.selectedRepository.replace('/situationsapi', '/csars');
    let csarsRequest = this.http.get(csarRepo, { responseType: 'text' });
    csarsRequest.subscribe(response => {
      let csars = response; let obj = JSON.parse(csars);
      for (let i = 0; i < obj.csars.length; i++) {
        let newOption = document.createElement("option");
        newOption.text = obj.csars[i].id;
        for (let j = 0; j < combibox.options.length; j++) {
          if (combibox.options.item(j).innerHTML === obj.csars[i].id) {
            containsCSAR = true;
          }
        }
        if (!containsCSAR) {
          combibox.add(newOption);
        }
      }
    });
  }

  /**
   * Takes the value of the situation text fields. If all entries are valid, a @POST request is made to the API.
   */
  getTextInputTrigger(): void {
    let trigger = this.fc.getTextInputTrigger();
    let result = this.fc.checkTextInputTrigger(this.situations, this.aggregatedSituations);
    if (result === 'ok') {
      this.postSituationTrigger(trigger);
      this.reset();
    } else {
      if (result !== 'ok') {
        this.failedSituationTriggerTextInput(result);
        this.reset();
      }
    }

  }

  /**
   * Error messages if the input is invalid
   * @param failedInput 
   */
  failedSituationTriggerTextInput(failedInput: string) {
    this.feedback.failedSituationTriggerTextInput(failedInput);
  }

  /**
   * Activates the field set which contains the input parameters based on the interface.
   */
  activateInputParameters() {
    (<HTMLFieldSetElement>document.getElementById("FieldsetInputParam")).hidden = false;
    let csar = (<HTMLSelectElement>document.getElementById('csar_combobox')).value;
    let combibox = <HTMLSelectElement>document.getElementById('interface_combobox');
    let containsInterface;
    let csarRepo = this.selectedRepository.replace('/situationsapi', '/csars/');
    if (csar !== 'none') {
      let csarsRequest = this.http.get(csarRepo + csar, { responseType: 'text' });
      csarsRequest.subscribe(response => {
        let servicetemplate = this.getServiceTemplateCsar(response);
        let interfaceOfCSAR = servicetemplate + '/boundarydefinitions/interfaces'
        let requestInterfaces = this.http.get(interfaceOfCSAR, { responseType: 'text' });
        requestInterfaces.subscribe(response2 => {
          let interfaces = response2; let obj = JSON.parse(interfaces);
          for (let i = 0; i < obj.interfaces.length; i++) {
            let newOption = document.createElement("option");
            newOption.text = obj.interfaces[i].name;
            for (let j = 0; j < combibox.options.length; j++) {
              if (combibox.options.item(j).innerHTML === obj.interfaces[i].name) {
                containsInterface = true;
              }
            }
            if (!containsInterface) {
              combibox.add(newOption);
            }
          }
        })
      });
    }
  }

  /**
   * Computes the possible operations based on the csar and the interfaces.
   * @param csar 
   */
  setPlan(csar) {
    let interfaceC = (<HTMLSelectElement>document.getElementById('interface_combobox')).value;
    let servicetemplate = this.getServiceTemplateCsar(csar);
    if (interfaceC !== 'none') {
      let interfaceOfCSAR = servicetemplate + '/boundarydefinitions/interfaces/' + interfaceC;
      return interfaceOfCSAR;
    }
  }

  /**
   * Computes the required plan paramaters based on the CSAR, interface and operation.
   */
  getPlanParameter() {
    let csar = (<HTMLSelectElement>document.getElementById('csar_combobox')).value;
    let operationName = (<HTMLInputElement>document.getElementById("operation_name")).value;
    let containsParameter;
    let combibox = <HTMLSelectElement>document.getElementById('plan_parameter_combobox');
    let csarRepo = this.selectedRepository.replace('/situationsapi', '/csars/');
    if (csar !== 'none' && operationName !== '') {
      let plan = this.http.get(csarRepo + csar, { responseType: 'text' });
      plan.subscribe(response => {
        let interfaceC = this.setPlan(response); let interfaceRequest = this.http.get(interfaceC, { responseType: 'text' });
          interfaceRequest.subscribe(response => {
            let operations = response; let obj = JSON.parse(operations);
            if (typeof obj.operations[operationName] !== 'undefined') {
              let inputParameter = obj.operations[operationName]._embedded.plan.input_parameters;
              for (let i = 0; i < inputParameter.length; i++) {
                let newOption = document.createElement("option");
                let planParam = new PlanParameter();
                planParam.name = inputParameter[i].name;
                planParam.type = inputParameter[i].type;
                planParam.value = inputParameter[i].value;
                newOption.text = planParam.name + ',' + planParam.type;
                for (let j = 0; j < combibox.options.length; j++) {
                  if (combibox.options.item(j).innerHTML === (planParam.name + ',' + planParam.type)) {
                    containsParameter = true;
                  }
                }
                if (!containsParameter) {
                  combibox.add(newOption);
                }
              }
            } else {
              this.failedSituationTriggerTextInput(operationName + ',O');
            }
            let displayText = combibox.options[combibox.selectedIndex].text.split(',');
            if (displayText[0] !== 'Select plan parameter') {
              (<HTMLInputElement>document.getElementById("nameInput")).value = displayText[0];
              (<HTMLInputElement>document.getElementById("typeInput")).value = displayText[1];
            }
          }, () => this.reset())
      }, () => this.reset());
    }
  }

  /**
   * Adds the content of the text fields to the input parameter list.
   */
  addInputParam() {
    this.fc.addInputParam();
  }

  /**
   * Removes the content of the text fields to the input parameter list.
   */
  removeInputParam() {
    this.fc.removeInputParam();
  }

  /**
   * Fill the text fields name, type and value with the content of the input paramters.
   */
  fillInputFields() {
    this.fc.fillInputFields();
  }

  /**
  * Sends a @POST request to the API to create a new situationtrigger.
  * @param trigger 
  */
  postSituationTrigger(trigger: SituationTrigger): void {
    let result = trigger.situation_ids;

    let post = this.http.post(this.selectedRepository + '/triggers', {
      situation_ids: result,
      aggregatedsituation_ids: trigger.aggregated_situation_ids,
      csar_id: trigger.csar_id,
      interface_name: trigger.interface_name,
      operation_name: trigger.operation_name,
      input_params: trigger.input_params,
      on_activation: trigger.on_activation,
      single_instance: trigger.single_instance
    });
    post.subscribe(() => { this.onCompletionSuccess('post'); this.refresh() }, err => { this.onCompletionErrorTrigger('post'); this.refresh() });
  }

  /**
   * Deletes the situationtrigger with the given id.
   * 
   * @param id
   */
  deleteTrigger(id: string): void {
    let deleteRequest = this.http.delete(this.selectedRepository + '/triggers/' + id, {});
    deleteRequest.subscribe(() => { this.onCompletionSuccessTrigger('delete'); this.refresh() },
      err => { this.onCompletionErrorTrigger(id +',D'); this.refresh(); });
  }

  /**
   * Deletes all situationtriggers.
   */
  deleteAllTriggers(): void {
    let arrayOfTriggerIds: string[] = new Array();
    this.situations.forEach(function (value) {
      arrayOfTriggerIds.push(value.id);
    })
    for (let i = 0; i < arrayOfTriggerIds.length; i++) {
      let id = arrayOfTriggerIds[i];
      this.deleteTrigger(id);
    }
  }

  /**
   * Error messages
   * @param typeOfRequest @POST / @DELETE 
   */
  onCompletionErrorTrigger(typeOfRequest: string) {
    this.feedback.onCompletionErrorTrigger(typeOfRequest);
  }

  /**
   * Confirmation messages
   * @param typeOfRequest @POST / @DELETE
   */
  onCompletionSuccessTrigger(typeOfRequest: string) {
    this.feedback.onCompletionSuccessTrigger(typeOfRequest);
  }

  /**
   * Colors the row where the situationtrigger is activated.
   * @param trigger 
   */
  colorTriggerRow(trigger: SituationTrigger) {
    this.fc.colorTriggerRow(trigger);
  }

  /**
   * Starts the situation-dependent execution of the plan if trigger active = all situations active.
   * @param trigger 
   */
  activate(trigger: SituationTrigger): void {
    let success = this.fc.activate(trigger, this.situations, this.aggregatedSituations);
    if (success) {
      this.selectPlan(trigger);
    }else{
      this.feedback.onCompletionError('activate');
    }
  }

  /**
   * Executes the plan (based on the interface and operation)
   * @param trigger 
   */
  selectPlan(trigger: SituationTrigger) {
    this.instanceId = null;

    let csar_id = trigger.csar_id;
    let interface_name = trigger.interface_name;

    let csarRepo = this.selectedRepository.replace('/situationsapi', '/csars/');
    if (csar_id !== '' && interface_name !== '') {
      let temp = this.http.get(csarRepo + csar_id, { responseType: 'text' });
      temp.subscribe(response => {
        let interfacesOfCSAR = this.getServiceTemplateCsar(response) + '/boundarydefinitions/interfaces/'+ interface_name;
        let httpPlanRequest = this.http.get(interfacesOfCSAR, { responseType: 'text' });
        let plan : Plan;
        httpPlanRequest.subscribe(response => {
          plan = this.getPlan(response, trigger);
          if (plan.plan_type.match('BuildPlan')) {
            this.appService.triggerManagementPlan(plan, this.instanceId).subscribe(() => { this.colorTriggerRow(trigger) }, () => this.onCompletionErrorTrigger(plan.id +',P'));
          } else {
            if (typeof trigger.input_params !== 'undefined') {
              for (let i = 0; i < trigger.input_params.length; i++) {
                if (trigger.input_params[i].name === 'OpenTOSCAContainerAPIServiceInstanceURL') {
                  this.instanceId = trigger.input_params[i].value
                }
              }
              this.appService.triggerManagementPlan(plan, this.instanceId).subscribe(() => { this.colorTriggerRow(trigger) }, () => this.onCompletionErrorTrigger(plan.id +',P'));
            }
          }
        }, () => this.onCompletionErrorTrigger(interface_name + ',I'));
      }, () => this.onCompletionErrorTrigger(csar_id + ',C'));
    }
  }


  /**
   * Returns the servicetemplate link from the CSAR.
   * @param text 
   */
  getServiceTemplateCsar(text: any) {
    let o = text;
    o = JSON.parse(text);
    return o._links.servicetemplate.href;
  }

  /**
   * 
   * Returns the plan based on the operation and interface of the trigger. 
   *
   * @param text response from the http Request to the interface
   * @param trigger responsible for the situation-dependent execution 
   */
  getPlan(text: string, trigger: SituationTrigger) {
    let plan = this.fc.getPlan(text, trigger);
    return plan;
  }
}