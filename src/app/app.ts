import { Component, signal } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { Spinner } from './components/spinner/spinner';

@Component({
  selector: 'app-root',
  imports: [Sidebar, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Chubb_FrontEnd');
}
