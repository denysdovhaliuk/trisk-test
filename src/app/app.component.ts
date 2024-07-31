import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  errorMessage: string | null = null;

  handleErrorMessage(error: string | null): void {
    this.errorMessage = error;
  }
}
