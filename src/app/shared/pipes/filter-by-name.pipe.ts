import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName',
  pure: false,
})
export class FilterByNamePipe implements PipeTransform {

  transform(items: any[], collaborators: string[] = []): any {
    if (!collaborators.length) {
      return items;
    }
    return items.filter(item => {
      return (
        collaborators.findIndex(collaborator => collaborator.toLowerCase() === item.user.login.toLowerCase()) !== -1
      );
    });
  }

}
