import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [],
  template: `<h1>Historique</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent {}
