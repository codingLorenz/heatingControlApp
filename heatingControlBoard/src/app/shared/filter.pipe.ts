import { JsonpClientBackend } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(values: any[], term: any): any {
    if(!values)return null
    if(!term)return values

    return values.filter(value=>JSON.stringify(value).includes(term))
  }

}
