import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../models/ResponseModel';
import { SeguroModel } from '../models/seguro.model';
import { FiltradoModel } from '../models/filtrado.model';

@Injectable({
  providedIn: 'root',
})
export class Seguro {
  baseUrl = `${environment.baseUrl}/Seguro`

  constructor(private http: HttpClient) { }

  ConsultarSeguros(filtros: FiltradoModel): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultarSeguros`, filtros);
  }

   ConsultarSeguroId(filtros: FiltradoModel, id: number): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultarSeguroId?id=${id}`, filtros);
  }

  RegistrarSeguro(Seguro: SeguroModel): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/RegistrarSeguro`, Seguro);
  }

  ActualizarSeguro(Seguro: SeguroModel): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ActualizarSeguro`, Seguro);
  }

  EliminarSeguro(id: number): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(`${this.baseUrl}/EliminarSeguro/${id}`);
  }

  ConsultaGeneral(filtros: FiltradoModel, cedula?: string, codigo?: string): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultaGeneral?cedula=${cedula || ''}&codigo=${codigo || ''}`, filtros);
  }
}
