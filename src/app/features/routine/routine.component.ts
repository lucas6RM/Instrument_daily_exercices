import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-routine',
  imports: [],
  template: `<h1>Routine</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutineComponent {}
