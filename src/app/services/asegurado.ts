import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FiltradoModel } from '../models/filtrado.model';

@Injectable({
  providedIn: 'root',
})
export class Asegurado {
  baseUrl = `${environment.baseUrl}/Asegurado`

  constructor(private http: HttpClient) { }

  obtenerAsegurados(filtros: FiltradoModel) {
    return this.http.post<any>(`${this.baseUrl}/ConsultarAsegurados`, filtros);
  }

  obtenerSeguros(filtros: FiltradoModel, id: number) {
    return this.http.post<any>(`${this.baseUrl}/ConsultarAseguradoId?id=${id}`, filtros);
  }

  cargaMasiva(formData: FormData) {
    return this.http.post<any>(`${this.baseUrl}/upload`, formData);
  }
}
