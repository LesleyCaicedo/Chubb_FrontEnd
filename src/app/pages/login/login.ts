import { Component } from '@angular/core';
import { Account as AccountService } from '../../services/account';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUser } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [provideIcons({
    heroUser
  })]
})
export class Login {
  usuario = '';
  clave = '';
  usuarioRecuperar = '';

  constructor(private loginService: AccountService, private router: Router) {
    if (loginService.isLogged()) {
      //this.toastService.showToast('Aviso', 'Ya cuenta con una sesión activa', ToastTypeEnum.INFO)
      this.router.navigateByUrl('');
    }
  }

  login() {
    const data = { usuario: this.usuario, clave: this.clave };
    this.loginService.login(data).subscribe({
      next: _ => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        Swal.fire({
          icon: 'info',
          title: 'Ocurrió un problema...',
          text: err.error.mensaje,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  limpiarUsuarioRecuperar(event?: any) {
    if (event && event.type === 'keyup' && event.key === 'Escape')
      this.usuarioRecuperar = ''
    else if (event === undefined)
      this.usuarioRecuperar = ''
  }

}
