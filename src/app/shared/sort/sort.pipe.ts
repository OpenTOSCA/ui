import { Pipe, PipeTransform } from '@angular/core';

import * as _ from 'lodash';

@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {

  transform(collection: any[], params: string[], orders: string[]): any {
    return _.orderBy(collection, params, orders);
  }
}
