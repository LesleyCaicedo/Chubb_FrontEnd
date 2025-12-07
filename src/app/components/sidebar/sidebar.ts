import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from "@angular/router";
import { Spinner as SpinnerService } from '../../services/spinner';
import { Account as AccountService } from '../../services/account';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUserCircle } from '@ng-icons/heroicons/outline';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterModule, NgIcon, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  providers: [provideIcons({
    heroUserCircle
  })]
})
export class Sidebar implements OnInit {
  isAseguradosOpen = true;
  user: any = { name: '', role: '', user: '' };

  constructor(private spinnerService: SpinnerService, private accountService: AccountService, private router: Router) { }

  ngOnInit(): void {
    const sesion = this.accountService.obtenerSesion();
    if (sesion) {
      this.user = {
        name: sesion.nombre || 'Usuario',
        role: sesion.rol || 'Sin rol',
        user: sesion.usuario || 'Usuario'
      };
    }
  }

  closeDrawerOnMobile() {
    // Cierra el drawer en móviles después de hacer click
    const drawerToggle = document.getElementById('my-drawer') as HTMLInputElement;
    if (drawerToggle && window.innerWidth < 1024) {
      drawerToggle.checked = false;
    }
  }

  logout() {
    this.spinnerService.show();

    setTimeout(() => {
      this.accountService.cerrarSesion();
      this.spinnerService.hide();
      this.router.navigateByUrl('/login');
    }, 500); // 0.5 Seg
  }
}
