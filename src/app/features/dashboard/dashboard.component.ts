import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `<h1>Dashboard</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
