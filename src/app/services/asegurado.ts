import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FiltradoModel } from '../models/filtrado.model';
import { ResponseModel } from '../models/ResponseModel';
import { Observable } from 'rxjs';
import { AseguradoModel } from '../models/asegurado.model';

@Injectable({
  providedIn: 'root',
})
export class Asegurado {
  baseUrl = `${environment.baseUrl}/Asegurado`

  constructor(private http: HttpClient) { }

  obtenerAsegurados(filtros: FiltradoModel): Observable<ResponseModel>  {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultarAsegurados`, filtros);
  }

  obtenerSeguros(filtros: FiltradoModel, id: number): Observable<ResponseModel>  {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultarAseguradoId?id=${id}`, filtros);
  }

  RegistrarAsegurado(Seguro: AseguradoModel): Observable<ResponseModel> {
      return this.http.post<ResponseModel>(`${this.baseUrl}/registrar`, Seguro);
  }

  ActualizarAsegurado(Seguro: AseguradoModel): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ActualizarAsegurado`, Seguro);
  }

  EliminarAsegurado(id: number, usuarioGestor: string): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(`${this.baseUrl}/EliminarAsegurado/${id}?usuarioGestor=${usuarioGestor}`);
  }
    
  cargaMasiva(formData: FormData, usuarioGestor: string): Observable<ResponseModel>  {
    return this.http.post<ResponseModel>(`${this.baseUrl}/upload?usuarioGestor=${usuarioGestor}`, formData);
  }
}
