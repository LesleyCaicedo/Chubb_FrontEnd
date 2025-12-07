import { Component, signal } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { Spinner } from './components/spinner/spinner';
import { CommonModule } from '@angular/common';
import { Account as AccountService } from './services/account';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [Sidebar, Spinner, CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Chubb_FrontEnd');
  onLogin = false;

  constructor(public accountService:AccountService, private router:Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.onLogin = (event.url === '/login');
    });
  }

}
