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
import { Plan } from '../core/model/plan.model';
import {SelectItem} from 'primeng/api';
import {Csar} from '../core/model/csar.model';
import {Interface} from '../core/model/interface.model';
import {Operation} from '../core/model/operation.model';
import {globals} from '../globals';
import {ServiceTemplateInstance} from '../core/model/service-template-instance.model';
import {ApplicationInstanceManagementService} from '../core/service/application-instance-management.service';
import {GrowlActions} from '../core/growl/growl-actions';


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

  console = console;

  public instanceId: string;

  situations: Array<Situation>;
  csars: Csar[];
  csar2interface: Map<Csar, Interface[]> = new Map<Csar, Interface[]>();
  csar2instance: Map<Csar, ServiceTemplateInstance[]> = new Map<Csar, ServiceTemplateInstance[]>();
  situationtriggers: Array<SituationTrigger>;
  aggregatedSituations = new Array<AggregatedSituation>();


  hiddenParams: string[];

  cols;
  colsOfTriggers;
  colsOfAggregatedSituations;

  // inputs and selection
  situationTemplateInput: string;
  situationThingInput: string;
  situationStateInput = false;

  selectableSituations: Situation[];
  selectedSituations: Situation[];
  selectOnActivation = false;
  selectSingleInstance = false;
  selectedCsar: Csar;
  selectedInstance: ServiceTemplateInstance;
  selectedInterface: Interface;
  selectedOperation: Operation;

  /**
   * The constructor of the class.
   *
   * @param ngRedux to dispatch the feedback
   * @param http for the communication with the Situation API
   * @param appService to access the normal execution of management plans
   */
  constructor(
    private ngRedux: NgRedux<AppState>,
    private http: HttpClient,
    private appService: ApplicationManagementService,
    private instancesService: ApplicationInstanceManagementService
  ) { }

  /**
   * Initialize the table for situations, aggregated situations and situationtriggers.
   */
  ngOnInit(): void {
      this.administrationItems$.subscribe(items => { let temp = ''; this.administrationItems = items; temp = temp + items; });

      // sets the selectedRepository to the API Endpoint
      this.selectedRepository = this.administrationItems + '/situationsapi';

      this.hiddenParams = globals.hiddenElements;

      this.appService.getResolvedApplications().subscribe(resolvedApplications => {
          this.csars = resolvedApplications;
          this.csars.forEach(value => {
              this.appService.getInterfaces(value.id).subscribe(val => this.csar2interface.set(value, val));
              this.instancesService.getServiceTemplateInstancesOfCsar(value)
                .subscribe(val => this.csar2instance.set(value, Array.from(val.values())));
          });
      });



    this.ngRedux.dispatch(BreadcrumbActions.updateBreadcrumb([
      { label: 'Situation', routerLink: ['/situation'] }
    ]));


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
      { field: 'csar_id', header: 'CSAR ID', sortable: true },
      { field: 'on_activation', header: 'active', sortable: true },
      { field: 'interface_name', header: 'Interface Name', sortable: true },
      { field: 'operation_name', header: 'Operation Name', sortable: true },
      { field: 'input_params', header: 'Input Parameter', sortable: true },
      { field: 'single_instance', header: 'Single Instance', sortable: true },
      { field: 'actions', header: 'actions', sortable: false }
    ];

      this.refresh();
  }

  /**
   * Sends multiple @GET requests to the Situation API
   */
  refresh(): void {
      console.log('Starting to refresh situations and triggers');
    this.refreshSituations();
    // this.refreshAggrSituations();
    this.refreshTriggers();

    // this.situations = new Array<Situation>();
    // this.situationtriggers = new Array<SituationTrigger>();
    // this.aggregatedSituations = new Array<AggregatedSituation>();
  }

  // situations



  /**
   * Format the @GET response and adds the situations from the API to the table.
   * @param jsonText the unparsed api response
   */
  editGetResponseSituations(jsonText: string): void {
    this.situations = this.parseSituationsResponse(jsonText);
    this.selectableSituations = this.situations;
  }

    /**
     * Format the @GET response and adds the situations from the API to the table.
     * @param jsonText the unparsed api response
     */
    parseSituationsResponse(jsonText: string): Situation[] {
        let o = jsonText;
        while (o.includes('_links')) {
            o = o.replace(',"_links"', '');
        }
        const situations = o;
        const obj = JSON.parse(situations);
        const situationsA: Situation[] = [];
        // number of situations
        if (obj.situations != null) {
            const length = obj.situations.length;

            // goes over all situations in the API and adds them to the table
            for (let i = 0; i < length; i++) {
                const situation = new Situation();
                situation.id = obj.situations[i].id;
                situation.situation_template_id = obj.situations[i].situation_template_id;
                situation.active = obj.situations[i].active;
                situation.thing_id = obj.situations[i].thing_id;
                situationsA.push(situation);
            }
            console.log('Fetched situations');
            return situationsA;
        }
        console.log('Couldnt fetch situations');
        return null;
    }

  createSituation() {
      let check = true;
      check = check && this.checkString(this.situationThingInput);
      check = check && this.checkString(this.situationTemplateInput);
      if (check) {
          const sit: Situation = new Situation();
          sit.situation_template_id = this.situationTemplateInput;
          sit.thing_id = this.situationThingInput;
          sit.active = String(this.situationStateInput);
          this.postSituation(sit);
      }
  }

  checkString(string: String): boolean {
      if (string === '' || string == null) {
          return false;
      } else {
          return true;
      }
  }

  /**
   * Sends a @POST request to the API to create a new situation.
   * @param situation the new situation data
   */
  postSituation(situation: Situation): void {
    const post = this.http.post(this.selectedRepository + '/situations', {
      situation_template_id: situation.situation_template_id,
      thing_id: situation.thing_id,
      active: situation.active
    });

    post.subscribe(() => { this.onCompletionSuccess('post'); this.refresh(); },
      () => { this.onCompletionError('post'); this.refresh(); });
  }


    /**
     * Changes the active from true/false to false/true.
     *
     * @param index column index where the active attribut need to be changed
     */
    switchActive(index) {
        const table = <HTMLTableElement>document.getElementById('sit');
        let active;
        for (let i = 1; i < table.getElementsByTagName('tr').length; i++) {
            // sucht die Tabellenzeile, dessen erste Spalte dem Index der Situation entspricht
            /* tslint:disable-next-line */ // cannot safely assume index is a string
            if (table.getElementsByTagName('tr').item(i).cells.item(0).innerText == index) {
                active = table.getElementsByTagName('tr').item(i).cells.item(2).innerText;
                if (active === 'true') {
                    active = 'false';
                } else {
                    active = 'true';
                }
                table.getElementsByTagName('tr').item(i).cells.item(2).innerText = active;
            }
        }
        return active;
    }


    /**
     * Format the @GET response and adds the aggregated situations from the API to the table.
     * @param jsonText the unparsed api response
     */
    editGetResponseAggregatedSituations(jsonText: string): Array<AggregatedSituation> {
        let o = jsonText;
        while (o.includes('_links')) {
            o = o.replace(',"_links"', '');
        }
        const aggregated_situations = o;
        const obj = JSON.parse(aggregated_situations);

        const aggregatedSituations = new Array<AggregatedSituation>();
        if (obj.aggregated_situations != null) {
            // number of aggregated situations
            const length = obj.aggregated_situations.length;


            // goes over all aggregated situations in the API and adds them to the table
            for (let i = 0; i < length; i++) {
                const aggregatedsituation = new AggregatedSituation();
                aggregatedsituation.id = obj.aggregated_situations[i].id;
                aggregatedsituation.situation_ids = obj.aggregated_situations[i].situation_ids;
                aggregatedsituation.logic_expression = obj.aggregated_situations[i].logic_expression;
                aggregatedsituation.active = obj.aggregated_situations[i].active;

                aggregatedSituations.push(aggregatedsituation);
            }

            return aggregatedSituations;
        }
        return null;

    }

  /**
   * Sends a @PUT request to the API to activate/deactivate a situation with the given id.
   *
   * @param id the id of the situation to toggle
   */
  putSituation(id: string): void {
    const active = this.switchActive(id);
    const put = this.http.put(this.selectedRepository + '/situations/' + id.toString(), {
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
   * @param id the id of the situation to delete
   */
  deleteSituation(id: string): void {
    const deleteRequest = this.http.delete(this.selectedRepository + '/situations/' + id, {});
    deleteRequest.subscribe(() => { this.onCompletionSuccess(id + ',D'); this.refresh(); },
      err => this.onCompletionError(id + ',D'));
  }

  /**
   * Deletes all situations.
   */
  deleteAllSituations(): void {
    const arrayOfSituationIds: string[] = new Array();
    this.situations.forEach(function (value) {
      arrayOfSituationIds.push(value.id);
    });
    for (let i = 0; i < arrayOfSituationIds.length; i++) {
      const id = arrayOfSituationIds[i];
      this.deleteSituation(id);
    }
  }


    /**
     * Format the @GET response and adds the situationtrigger from the API to the table.
     * @param jsonText the unparsed api response
     */
    editGetResponseTriggers(jsonText: string): Array<SituationTrigger> {
        let o = jsonText;

        console.log('Received following json:');
        console.log(jsonText);

        while (o.includes('_links')) {
            o = o.replace(',"_links"', '');
        }

        const situation_triggers = o;
        const obj = JSON.parse(situation_triggers);

        const situationtriggers = new Array<SituationTrigger>();
        if (obj.situation_triggers != null) {
            // number of situationtriggers
            const length = obj.situation_triggers.length;

            for (let i = 0; i < length; i++) {
                const trigger = new SituationTrigger();
                trigger.id = obj.situation_triggers[i].id;
                trigger.situation_ids = obj.situation_triggers[i].situation_ids;
                trigger.aggregated_situation_ids = obj.situation_triggers[i].aggregated_situations_ids;
                trigger.csar_id = obj.situation_triggers[i].csar_id;
                trigger.on_activation = obj.situation_triggers[i].on_activation;
                trigger.interface_name = obj.situation_triggers[i].interface_name;
                trigger.operation_name = obj.situation_triggers[i].operation_name;
                trigger.single_instance = obj.situation_triggers[i].single_instance;
                const lengthInput = obj.situation_triggers[i].input_params.length;
                console.log('Inputparams length:');
                console.log(lengthInput);
                const inputParameter = new Array<PlanParameter>();
                for (let j = 0; j < lengthInput; j++) {
                    const planParam = new PlanParameter();
                    planParam.name = obj.situation_triggers[i].input_params[j].name;
                    planParam.type = obj.situation_triggers[i].input_params[j].type;
                    planParam.value = obj.situation_triggers[i].input_params[j].value;
                    inputParameter.push(planParam);
                }
                trigger.input_params = inputParameter;
                console.log('Parsed following trigger:');
                console.log(trigger);
                situationtriggers.push(trigger);
            }
            this.situationtriggers = situationtriggers;
            return situationtriggers;
        } else {
            return null;
        }
    }

    /**
     * Colors the row where the situationtrigger is activated.
     * @param trigger the situation trigger
     */
    colorTriggerRow(trigger: SituationTrigger) {
        const table = <HTMLTableElement>document.getElementById('triggers');
        let colorCells;

        for (let i = 1; i < table.getElementsByTagName('tr').length; i++) {
            if (table.getElementsByTagName('tr').item(i).cells.item(0).innerText === trigger.id) {
                colorCells = table.getElementsByTagName('tr').item(i).cells;
                for (let j = 0; j < colorCells.length; j++) {
                    table.getElementsByTagName('tr').item(i).cells.item(j).style.background = '#c1c3c5';
                }
            }
        }
    }

    /**
     * Starts the situation-dependent execution of the plan if trigger active = all situations active.
     * @param trigger the situation trigger
     */
    activateTrigger(trigger: SituationTrigger, situations: Array<Situation>, aggregated_situations: Array<AggregatedSituation>): boolean {
        const active = trigger.on_activation;
        const success = true;
        let index;

        // situationtriggers must contain at least one situation or aggregated situation
        if (trigger.aggregated_situation_ids.length === 0 && trigger.situation_ids.length === 0) {
            return false;
        }

        // check if trigger active = all situations active
        for (let i = 0; i < trigger.situation_ids.length; i++) {
            for (let j = 0; j < situations.length; j++) {
                if (situations[j].id === trigger.situation_ids[i]) {
                    index = j;
                    if (situations[index].active.toString() !== active) {
                        return false;
                    }
                }
            }
        }

        // check if trigger active = all aggr situations active
        for (let i = 0; i < trigger.aggregated_situation_ids.length; i++) {
            for (let j = 0; j < aggregated_situations.length; j++) {
                if (aggregated_situations[j].id === trigger.aggregated_situation_ids[i]) {
                    index = j;
                    if (aggregated_situations[index].active.toString() !== active) {
                        return false;
                    }
                }
            }
        }

        return success;
    }


    /**
     *
     * Returns the plan based on the operation and interface of the trigger.
     *
     * @param text response from the http Request to the interface
     * @param trigger responsible for the situation-dependent execution
     */
    getPlan(text: string, trigger: SituationTrigger) {
        const o = text;
        const obj = JSON.parse(o);
        const operation_name = trigger.operation_name;
        if (operation_name !== null) {
            const temp = obj.operations[operation_name]._embedded.plan;

            const plan = new Plan();
            plan.id = temp.id;
            plan.plan_type = temp.plan_type;
            plan.plan_language = temp.plan_language;
            for (let j = 0; j < trigger.input_params.length; j++) {
                for (let i = 0; i < temp.input_parameters.length; i++) {
                    if (typeof trigger.input_params !== 'undefined') {
                        if (temp.input_parameters[i].name === trigger.input_params[j].name) {
                            temp.input_parameters[i].value = trigger.input_params[j].value;
                        }
                    }
                }
            }
            plan.input_parameters = temp.input_parameters;
            plan.output_parameters = temp.output_parameters;
            plan.plan_model_reference = temp.plan_model_reference;
            plan._links = temp._links;

            return plan;
        }
    }



    /**
     * Sends a @GET requests to the Situation API.
     */
    refreshSituations(): void {
        this.http.get(this.selectedRepository + '/situations', { responseType: 'text' })
            .subscribe(response => this.editGetResponseSituations(response));
    }
  /**
   * Sends a @GET request to the Situation API to get all triggers.
   */
  refreshTriggers(): void {
    const triggers = this.http.get(this.selectedRepository + '/triggers', { responseType: 'text' });
    triggers.subscribe(response2 => this.editGetResponseTriggers(response2));
  }

  createSituationTrigger(): void {
      const trigger: SituationTrigger = new SituationTrigger();
      trigger.situation_ids = new Array<string>();
      this.selectedSituations.forEach(value => trigger.situation_ids.push(value.id));
      trigger.csar_id = this.selectedCsar.id;
      trigger.interface_name = this.selectedInterface.name;
      trigger.operation_name = this.selectedOperation.name;
      trigger.single_instance = String(this.selectSingleInstance);
      trigger.on_activation = String(this.selectOnActivation);
      trigger.input_params = this.selectedOperation._embedded.plan.input_parameters;

      if (this.selectedInstance !== null && this.selectedInstance !== undefined) {
          trigger.service_instance_id = String(this.selectedInstance.id);
      }

      this.postSituationTrigger(trigger);
  }

  resetSituationTriggerInput(): void {
      this.selectedSituations = new Array<Situation>();
      this.selectedCsar = null;
      this.selectedInterface = null;
      this.selectedOperation = null;
      this.selectedInstance = null;

  }

  /**
  * Sends a @POST request to the API to create a new situationtrigger.
  * @param trigger the situation trigger
  */
  postSituationTrigger(trigger: SituationTrigger): void {
    const result = trigger.situation_ids;

    const post = this.http.post(this.selectedRepository + '/triggers', {
      situation_ids: result,
      // aggregatedsituation_ids: trigger.aggregated_situation_ids,
      csar_id: trigger.csar_id,
      interface_name: trigger.interface_name,
      operation_name: trigger.operation_name,
      input_params: trigger.input_params,
      on_activation: trigger.on_activation,
      service_instance_id: trigger.service_instance_id,
      single_instance: trigger.single_instance
    });
    post.subscribe(
        () => { this.onCompletionSuccess('post'); this.refresh(); },
        err => { this.onCompletionErrorTrigger('post'); this.refresh(); }
    );
  }

  /**
   * Deletes the situationtrigger with the given id.
   *
   * @param id the id of the trigger to delete
   */
  deleteTrigger(id: string): void {
    const deleteRequest = this.http.delete(this.selectedRepository + '/triggers/' + id, {});
    deleteRequest.subscribe(() => { this.onCompletionSuccessTrigger('delete'); this.refresh(); },
      err => { this.onCompletionErrorTrigger(id + ',D'); this.refresh(); });
  }

  /**
   * Deletes all situationtriggers.
   */
  deleteAllTriggers(): void {
    const arrayOfTriggerIds: string[] = new Array();
    this.situations.forEach(function (value) {
      arrayOfTriggerIds.push(value.id);
    });
    for (let i = 0; i < arrayOfTriggerIds.length; i++) {
      const id = arrayOfTriggerIds[i];
      this.deleteTrigger(id);
    }
  }

  /**
   * Starts the situation-dependent execution of the plan if trigger active = all situations active.
   * @param trigger the situation trigger
   */
  activate(trigger: SituationTrigger): void {
    const success = this.activateTrigger(trigger, this.situations, this.aggregatedSituations);
    if (success) {
      this.selectPlan(trigger);
    } else {
      this.onCompletionError('activate');
    }
  }

  /**
   * Executes the plan (based on the interface and operation)
   * @param trigger the situation trigger
   */
  selectPlan(trigger: SituationTrigger) {
    this.instanceId = null;

    const csar_id = trigger.csar_id;
    const interface_name = trigger.interface_name;

    const csarRepo = this.selectedRepository.replace('/situationsapi', '/csars/');
    if (csar_id !== '' && interface_name !== '') {
      const temp = this.http.get(csarRepo + csar_id, { responseType: 'text' });
      temp.subscribe(response => {
        const interfacesOfCSAR = this.getServiceTemplateCsar(response) + '/boundarydefinitions/interfaces/' + interface_name;
        const httpPlanRequest = this.http.get(interfacesOfCSAR, { responseType: 'text' });
        let plan: Plan;
        httpPlanRequest.subscribe(innerResponse => {
          plan = this.getPlan(innerResponse, trigger);
          if (plan.plan_type.match('BuildPlan')) {
            this.appService.triggerManagementPlan(plan, this.instanceId)
                .subscribe(
                    () => { this.colorTriggerRow(trigger); },
                    () => this.onCompletionErrorTrigger(plan.id + ',P')
                );
          } else {
            if (typeof trigger.input_params !== 'undefined') {
              for (let i = 0; i < trigger.input_params.length; i++) {
                if (trigger.input_params[i].name === 'OpenTOSCAContainerAPIServiceInstanceURL') {
                  this.instanceId = trigger.input_params[i].value;
                }
              }
              this.appService.triggerManagementPlan(plan, this.instanceId)
                .subscribe(
                    () => { this.colorTriggerRow(trigger); },
                    () => this.onCompletionErrorTrigger(plan.id + ',P')
                );
            }
          }
        }, () => this.onCompletionErrorTrigger(interface_name + ',I'));
      }, () => this.onCompletionErrorTrigger(csar_id + ',C'));
    }
  }


  /**
   * Returns the servicetemplate link from the CSAR.
   * @param text string containing a json representation of a CSAR
   */
  getServiceTemplateCsar(text: any) {
    let o = text;
    o = JSON.parse(text);
    return o._links.servicetemplate.href;
  }

    /**
     * Confirmation messages
     * @param typeOfRequest either "post" or "delete" or "put"
     */
    onCompletionSuccess(typeOfRequest: string) {
        const filterRequest = typeOfRequest.split(',');
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
                    detail: `The aggregated situations and the situationtriggers which contains the situation'
                            + ' and the situation are successfully deleted.`
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
     * @param typeOfRequest either "post", "activate", "delete" or "put"
     */
    onCompletionError(typeOfRequest: string): void {
        const filterRequest = typeOfRequest.split(',');
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
                    detail: 'The active attribute of the situation trigger and of it is situations'
                            + ' and aggregated situations are not corresponding.'
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
     * Confirmation messages
     * @param typeOfRequest either "post" or "delete" or "put"
     */
    onCompletionSuccessAggregatedSituation(typeOfRequest: string) {
        const filterRequest = typeOfRequest.split(',');
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
     * @param typeOfRequest either "post" or "delete"
     */
    onCompletionErrorAggregatedSituation(typeOfRequest: string) {
        const filterRequest = typeOfRequest.split(',');
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
     *
     * @param failedInput name of the invalid input
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
     * @param typeOfRequest either "post" or "delete"
     */
    onCompletionErrorTrigger(typeOfRequest: string) {
        const filterRequest = typeOfRequest.split(',');
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
        } else if ( filterRequest[1] === 'D') {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Delete of situationtrigger ' + filterRequest[0] + ' failed',
                    detail: `The situationtrigger is not deleted.`
                }
            ));
        } else {
            this.ngRedux.dispatch(GrowlActions.addGrowl(
                {
                    severity: 'error',
                    summary: 'Execution of plan failed',
                    detail: 'The plan ' + filterRequest[0] + ' is not executed.'
                }
            ));
        }
    }

    /**
     * Confirmation messages
     *
     * @param typeOfRequest either "post" or "delete"
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
     *
     * @param failedInput name of the invalid input
     */
    failedSituationTriggerTextInput(failedInput: string) {
        const filterInput = failedInput.split(',');
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
