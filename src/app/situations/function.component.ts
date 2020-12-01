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
import { Situation } from './model/situation.module';
import { SituationTrigger } from './model/situationtrigger.module';
import { AggregatedSituation } from './model/agggregatedSituation.module';
import { PlanParameter } from './../core/model/plan-parameter.model';
import { Plan } from '../core/model/plan.model';


@Component({
  selector: 'opentosca-situation',
  templateUrl: './situation.component.html',
  styleUrls: ['./situation.component.scss'],
})

/**
 * This class contains the auxiliary methods for the http requests
 *
 * @author Lavinia Stiliadou
 */
export class FunctionComponent implements OnInit {
  ngOnInit(): void { }






  /**
   * Changes the active from true/false to false/true.
   *
   * @param index column index where the active attribut need to be changed
   */
  switchActive(index) {
    let table = <HTMLTableElement>document.getElementById('sit'),
      active;
    for (let i = 1; i < table.getElementsByTagName("tr").length; i++) {
      // sucht die Tabellenzeile, dessen erste Spalte dem Index der Situation entspricht
      if (table.getElementsByTagName("tr").item(i).cells.item(0).innerText == index) {
        active = table.getElementsByTagName("tr").item(i).cells.item(2).innerText;
        if (active === 'true') {
          active = 'false';
        } else {
          active = 'true';
        }
        table.getElementsByTagName("tr").item(i).cells.item(2).innerText = active;
      };
    }
    return active;
  }


  /**
   * Format the @GET response and adds the aggregated situations from the API to the table.
   * @param jsonText
   */
  editGetResponseAggregatedSituations(jsonText: string): Array<AggregatedSituation> {
    let o = jsonText;
    while (o.includes('_links')) {
      o = o.replace(",\"_links\"", "");
    }
    let aggregated_situations = o;
    let obj = JSON.parse(aggregated_situations);

    let aggregatedSituations = new Array<AggregatedSituation>();
    if (obj.aggregated_situations != undefined) {
      // number of aggregated situations
      let length = obj.aggregated_situations.length;


      // goes over all aggregated situations in the API and adds them to the table
      for (let i = 0; i < length; i++) {
        let aggregatedsituation = new AggregatedSituation();
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
   * Takes the value of text fields and returns the aggregated situation.
   */
  getTextInputAggregatedSituation(): AggregatedSituation {
    let aggregateSituation_ids = (<HTMLInputElement>document.getElementById('aggregateSituation_ids')).value,
      logic_expression = (<HTMLInputElement>document.getElementById('logic_expression')).value;

    let aggregatedSituation = new AggregatedSituation();
    let arrayOfAggregatedSituationIds = aggregateSituation_ids.split(',');

    // to filter duplicates
    let uniqueArray = arrayOfAggregatedSituationIds.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    aggregatedSituation.situation_ids = uniqueArray;
    aggregatedSituation.active = 'false';
    aggregatedSituation.logic_expression = logic_expression;
    return aggregatedSituation;
  }

  /**
   * Checks that all inputs are valid.
   * @situations contains all valid situation IDs
   */
  checkTextInputAggregatedSituation(situations: Array<Situation>): string {
    let failed = false,
      failedExp = false,
      aggregateSituation_ids = (<HTMLInputElement>document.getElementById('aggregateSituation_ids')).value,
      logic_expression = (<HTMLInputElement>document.getElementById('logic_expression')).value,
      temp = aggregateSituation_ids.trim(),
      arrayOfAggregatedSituationIds = temp.split(',');

    // logic expression should start with a number (then an operator and a number)
    let regex: RegExp;
    regex = /^[0-9]+(?:(?:\|\||&&)[0-9]+)*$/;
    let situationLogExp = logic_expression.split(/\|\||&&/);

    // to filter duplicates
    let uniqueArray = arrayOfAggregatedSituationIds.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    // checks if the logic expression is according to the scheme
    if (!regex.test(logic_expression)) {
      return 'Expression';
    }

    // checks if the logic expression contains the aggregated situation ids
    for (let i = 0; i < situationLogExp.length; i++) {
      let id = situationLogExp[i];
      if (uniqueArray.indexOf(id) === -1) {
        failedExp = true;
      }
    }

    for (let i = 0; i < uniqueArray.length; i++) {
      let id = uniqueArray[i];
      // checks if the logic expression contains situation ids that are not aggregated
      if (situationLogExp.indexOf(id) === -1) {
        failedExp = true;
      }
      //checks if the input for the situations that need to be aggregated contains unknown situations
      if (situations == undefined) {
        return 'Situation IDs';
      }
      if (!situations.some(s => s.id == id)) {
          failed = true;
          return 'Situation IDs';
        }

    }

    if (failedExp) {
      return 'ExpressionSit';
    }
    return 'ok';
  }

  /**
   * To edit a aggregated situation.
   * @param instanceId id of the aggregated situation
   */
  editInstance(instanceId: string) {
    let table = <HTMLTableElement>document.getElementById("aggregated");
    let editButton = <HTMLButtonElement>document.getElementById("editButton");
    editButton.disabled = false;
    let colorCells;
    for (let i = 1; i < table.getElementsByTagName("tr").length; i++) {
      if (table.getElementsByTagName("tr").item(i).cells.item(0).innerText == instanceId) {
        (<HTMLInputElement>document.getElementById("aggregateSituation_id")).value = table.getElementsByTagName("tr").item(i).cells.item(0).innerText;
        (<HTMLInputElement>document.getElementById("aggregateSituation_ids")).value = table.getElementsByTagName("tr").item(i).cells.item(1).innerText;
        (<HTMLInputElement>document.getElementById("logic_expression")).value = table.getElementsByTagName("tr").item(i).cells.item(2).innerText;
        colorCells = table.getElementsByTagName("tr").item(i).cells;
        for (let j = 0; j < colorCells.length; j++) {
          table.getElementsByTagName("tr").item(i).cells.item(j).style.background = "#c1c3c5";
        }
        setTimeout(() => {
          colorCells = table.getElementsByTagName("tr").item(i).cells;
          for (let j = 0; j < colorCells.length; j++) {
            table.getElementsByTagName("tr").item(i).cells.item(j).style.background = "none";
          }
        }, 1000);

      };
    }
  }

  /**
   * Write the input of the text fields back to the table.
   * @param situations
   */
  applyTable(situations: Array<Situation>): AggregatedSituation {
    let table = <HTMLTableElement>document.getElementById("aggregated");
    let editButton = <HTMLButtonElement>document.getElementById("editButton");
    let instanceId = (<HTMLInputElement>document.getElementById('aggregateSituation_id')).value;
    editButton.disabled = true;
    for (let i = 1; i < table.getElementsByTagName("tr").length; i++) {
      if (table.getElementsByTagName("tr").item(i).cells.item(0).innerText === instanceId) {
        // checks that only valid aggregated situations are written back to the table
        if (this.checkTextInputAggregatedSituation(situations) === 'ok') {
          let aggregatedSituation = new AggregatedSituation();
          aggregatedSituation.id = instanceId;
          let temp = (<HTMLInputElement>document.getElementById("aggregateSituation_ids")).value;
          temp = temp.trim();
          let arrayOfAggregatedSituationIds = temp.split(',');
          aggregatedSituation.situation_ids = arrayOfAggregatedSituationIds;
          aggregatedSituation.logic_expression = (<HTMLInputElement>document.getElementById("logic_expression")).value;
          table.getElementsByTagName("tr").item(i).cells.item(1).innerText = (<HTMLInputElement>document.getElementById("aggregateSituation_ids")).value;
          table.getElementsByTagName("tr").item(i).cells.item(2).innerText = (<HTMLInputElement>document.getElementById("logic_expression")).value;
          return aggregatedSituation;
        }
      };
    }
  }

  /**
   * Format the @GET response and adds the situationtrigger from the API to the table.
   * @param jsonText
   */
  editGetResponseTriggers(jsonText: string): Array<SituationTrigger> {
    let o = jsonText;

    while (o.includes('_links')) {
      o = o.replace(",\"_links\"", "");
    }

    let situation_triggers = o;
    let obj = JSON.parse(situation_triggers);

    let situationtriggers = new Array<SituationTrigger>();
    if (obj.situation_triggers != undefined) {
      // number of situationtriggers
      let length = obj.situation_triggers.length;

      for (let i = 0; i < length; i++) {
        let trigger = new SituationTrigger();
        trigger.id = obj.situation_triggers[i].id;
        trigger.situation_ids = obj.situation_triggers[i].situation_ids;
        trigger.aggregated_situation_ids = obj.situation_triggers[i].aggregated_situations_ids;
        trigger.csar_id = obj.situation_triggers[i].csar_id;
        trigger.on_activation = obj.situation_triggers[i].on_activation;
        trigger.interface_name = obj.situation_triggers[i].interface_name;
        trigger.operation_name = obj.situation_triggers[i].operation_name;
        trigger.single_instance = obj.situation_triggers[i].single_instance;
        let lengthInput = obj.situation_triggers[i].input_params.length;
        let inputParameter = new Array<PlanParameter>();
        for (let j = 0; j < lengthInput; j++) {
          let planParam = new PlanParameter();
          planParam.name = obj.situation_triggers[i].input_params[j].name;
          planParam.type = obj.situation_triggers[i].input_params[j].type;
          planParam.value = obj.situation_triggers[i].input_params[j].value;
          inputParameter.push(planParam);
        }
        trigger.input_params = inputParameter;
        situationtriggers.push(trigger);
      }
      return situationtriggers;
    } else {
      return null;
    }
  }

  /**
   *
   * Takes the value of the situationtrigger text fields and returns a situationstrigger.
   *
   */
  getTextInputTrigger(): SituationTrigger {
    let situation_ids = (<HTMLInputElement>document.getElementById('situation_ids')).value,
      csar_id = (<HTMLSelectElement>document.getElementById('csar_combobox')).value,
      on_activation = (<HTMLInputElement>document.getElementById('on_activation')).value,
      interface_name = (<HTMLSelectElement>document.getElementById('interface_combobox')).value,
      operation_name = (<HTMLInputElement>document.getElementById('operation_name')).value,
      single_instance = (<HTMLInputElement>document.getElementById('single_instance')).value,
      inputParameter = (<HTMLSelectElement>document.getElementById('input_parameter_combobox'));


    let arrayOfSituationIds = situation_ids.split(',');

    let trigger = new SituationTrigger();
    let input = new Array<PlanParameter>();
    trigger.situation_ids = arrayOfSituationIds;
    trigger.csar_id = csar_id;
    trigger.on_activation = on_activation;
    trigger.interface_name = interface_name;
    trigger.operation_name = operation_name;
    for (let j = 0; j < inputParameter.options.length; j++) {
      let planParameter = new PlanParameter();
      let arrOptions = inputParameter.options[j].value.split(',');
      planParameter.name = arrOptions[0];
      planParameter.type = arrOptions[1];
      planParameter.value = arrOptions[2];
      input.push(planParameter);
    }

    trigger.single_instance = single_instance;
    trigger.input_params = input;

    return trigger;
  }

  /**
   * Checks that all inputs are valid.
   * @situations contains all valid situation IDs
   * @aggregated_situations contains all valid aggregated situation IDs
   */
  checkTextInputTrigger(situations: Array<Situation>, aggregated_situations: Array<AggregatedSituation>): string {
    let situation_ids = (<HTMLInputElement>document.getElementById('situation_ids')).value,
      csar_id = (<HTMLSelectElement>document.getElementById('csar_combobox')).value,
      on_activation = (<HTMLInputElement>document.getElementById('on_activation')).value,
      interface_name = (<HTMLSelectElement>document.getElementById('interface_combobox')).value,
      single_instance = (<HTMLInputElement>document.getElementById('single_instance')).value,
      operation_name = (<HTMLInputElement>document.getElementById('operation_name')).value,
      inputParameter = (<HTMLSelectElement>document.getElementById('input_parameter_combobox')),
      check = false;


    // Checks whether the value of the input parameters is empty
    for (let j = 0; j < inputParameter.options.length; j++) {
      let arrOptions = inputParameter.options[j].value.split(',');
      let value = arrOptions[2];
      if (value === "") {
        return 'Value';
      }
    }

    let arrayOfSituationIds = situation_ids.split(',');
    for (let i = 0; i < arrayOfSituationIds.length; i++) {
      let id = arrayOfSituationIds[i];
      if (situation_ids === '') {
        check = true;
      } else {
        // checks if the input of the text field contains unknown situations
        if (!situations.some(s => s.id == id)) {
          return 'Situation IDs';
        }
      }
    }

    if (csar_id === "none") {
      return 'CSAR ID';
    } else if (operation_name === "") {
      return 'Operation name';
    } else if (interface_name === "none") {
      return 'Interface name';
    } else if (on_activation !== "true" && on_activation !== 'false') {
      return 'Active';
    } else if (single_instance !== "true" && single_instance !== 'false') {
      return 'Single Instance';
    }
    return 'ok';
  }

  /**
   * Adds the content of the text fields to the input parameter list.
   */
  addInputParam() {
    let combibox = <HTMLSelectElement>document.getElementById('input_parameter_combobox');
    let newOption = document.createElement("option");
    let containsParameter = false;
    let update = false;
    let index;
    let planParam = new PlanParameter();
    planParam.name = (<HTMLInputElement>document.getElementById("nameInput")).value;
    planParam.type = (<HTMLInputElement>document.getElementById("typeInput")).value;
    planParam.value = (<HTMLInputElement>document.getElementById("valueInput")).value;
    newOption.text = planParam.name + ',' + planParam.type + ',' + planParam.value;
    for (let j = 0; j < combibox.options.length; j++) {
      if (combibox.options.item(j).innerHTML === (planParam.name + ',' + planParam.type + ',' + planParam.value)) {
        containsParameter = true;
      }
      let temp = combibox.options.item(j).innerHTML.split(",");
      if ((temp[0] === planParam.name) && (temp[1] === planParam.type)) {
        update = true;
        index = j;
      }
    }
    if (update) {
      combibox.remove(index);
      combibox.add(newOption);
    }
    if (!containsParameter) {
      combibox.add(newOption);
    }
  }

  /**
   * Removes the content of the text fields to the input parameter list.
   */
  removeInputParam() {
    let combobox = <HTMLSelectElement>document.getElementById('input_parameter_combobox');
    let newOption = document.createElement("option");
    let index;
    let planParam = new PlanParameter();
    planParam.name = (<HTMLInputElement>document.getElementById("nameInput")).value;
    planParam.type = (<HTMLInputElement>document.getElementById("typeInput")).value;
    planParam.value = (<HTMLInputElement>document.getElementById("valueInput")).value;
    newOption.text = planParam.name + ',' + planParam.type + ',' + planParam.value;
    for (let j = 0; j < combobox.options.length; j++) {
      if (combobox.options.item(j).innerHTML === (planParam.name + ',' + planParam.type + ',' + planParam.value)) {
        index = j;
        combobox.remove(index);
      }
    }
  }

  /**
   * Fill the text fields name, type and value with the content of the input paramters.
   */
  fillInputFields() {
    let combibox = <HTMLSelectElement>document.getElementById('input_parameter_combobox');
    if (combibox.options[combibox.selectedIndex] !== null && typeof combibox.options[combibox.selectedIndex] !== 'undefined') {
      let displayText = combibox.options[combibox.selectedIndex].text.split(',');
      if (displayText[0] !== 'Select plan parameter') {
        (<HTMLInputElement>document.getElementById("nameInput")).value = displayText[0];
        (<HTMLInputElement>document.getElementById("typeInput")).value = displayText[1];
        (<HTMLInputElement>document.getElementById("valueInput")).value = displayText[2];
      }
    }
  }

  /**
   * Colors the row where the situationtrigger is activated.
   * @param trigger
   */
  colorTriggerRow(trigger: SituationTrigger) {
    let table = <HTMLTableElement>document.getElementById("triggers");
    let colorCells;

    for (let i = 1; i < table.getElementsByTagName("tr").length; i++) {
      if (table.getElementsByTagName("tr").item(i).cells.item(0).innerText === trigger.id) {
        colorCells = table.getElementsByTagName("tr").item(i).cells;
        for (let j = 0; j < colorCells.length; j++) {
          table.getElementsByTagName("tr").item(i).cells.item(j).style.background = "#c1c3c5";
        }
      };
    }
  }

  /**
   * Starts the situation-dependent execution of the plan if trigger active = all situations active.
   * @param trigger
   */
  activate(trigger: SituationTrigger, situations: Array<Situation>, aggregated_situations: Array<AggregatedSituation>): boolean {
    let active = trigger.on_activation;
    let success = true;
    let index;

    // situationtriggers must contain at least one situation or aggregated situation
    if (trigger.aggregated_situation_ids.length == 0 && trigger.situation_ids.length == 0) {
      return false;
    }

    // check if trigger active = all situations active
    for (let i = 0; i < trigger.situation_ids.length; i++) {
      for (let j = 0; j < situations.length; j++) {
        if (situations[j].id == trigger.situation_ids[i]) {
          index = j;
          if (situations[index].active.toString() != active) {
            return false;
          }
        }
      }
    }

    // check if trigger active = all aggr situations active
    for (let i = 0; i < trigger.aggregated_situation_ids.length; i++) {
      for (let j = 0; j < aggregated_situations.length; j++) {
        if (aggregated_situations[j].id == trigger.aggregated_situation_ids[i]) {
          index = j;
          if (aggregated_situations[index].active.toString() != active) {
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
    let o = text;
    let obj = JSON.parse(o);
    let operation_name = trigger.operation_name;
    if (operation_name !== null) {
      let temp = obj.operations[operation_name]._embedded.plan;

      let plan = new Plan();
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

}
