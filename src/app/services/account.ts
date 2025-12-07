import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { SesionModel } from '../models/sesion.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Account {
  private currentSesionSource = new BehaviorSubject<SesionModel | null>(this.obtenerSesion());
  currentSesion$ = this.currentSesionSource.asObservable();
  private apiUrl = `${environment.baseUrl}/Cuenta`;
  constructor(private http: HttpClient) { }

  login(credentials: { usuario: string; clave: string }) {
    return this.http.post(`${this.apiUrl}/Login`, credentials).pipe(
      tap((res: any) => {
        if (res.datos !== null) {
          this.guardarSesion(res.datos.tokenDeAcceso);
        }
      })
    );
  }

  isLogged(): boolean {
    if (localStorage.getItem('sesiondata')) return true;
    return false;
  }

  obtenerSesion() {
    if (!this.isLogged()) return null;
    return JSON.parse(atob(localStorage.getItem('sesiondata')!)) as SesionModel
  }

  private guardarSesion(token: string) {
    let tokenData = JSON.parse(atob(token.split('.')[1]));
    let sesionData = {
      idUsuario: parseInt(tokenData.IdUsuario),
      nombre: tokenData.Nombre,
      correo: tokenData.Correo,
      usuario: tokenData.Usuario,
      rol: tokenData.Rol,
      permisos: tokenData.Permisos
    } as SesionModel;

    localStorage.setItem('tokendata', token);
    localStorage.setItem('sesiondata', btoa(JSON.stringify(sesionData)));
    this.currentSesionSource.next(sesionData);
  }

  cerrarSesion() {
    localStorage.clear();
    this.currentSesionSource.next(null);
  }
}
