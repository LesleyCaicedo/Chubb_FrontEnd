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

  EliminarSeguro(id: number, usuarioGestor: string): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(`${this.baseUrl}/EliminarSeguro/${id}?usuarioGestor=${usuarioGestor}`);
  }

  ConsultaGeneral(filtros: FiltradoModel, cedula?: string, codigo?: string): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultaGeneral?cedula=${cedula || ''}&codigo=${codigo || ''}`, filtros);
  }

  ConsultarSegurosPorEdad(edad: number): Observable<any> {
    const body = {
      edadMin: edad,
      edadMax: edad,
      incluirGenerales: true 
    };
    return this.http.post(`${this.baseUrl}/ConsultarSegurosPorEdad`,body);
  }

    ConsultarSegurosPorRangoEdad(edadMin: number | null, edadMax: number | null, incluirGenerales: boolean): Observable<any> {
    const body = {
      edadMin: edadMin,
      edadMax: edadMax,
      incluirGenerales: incluirGenerales
    };
    return this.http.post(`${this.baseUrl}/ConsultarSegurosPorEdad`, body);
  }

  cargaMasiva(formData: FormData, usuarioGestor: string): Observable<ResponseModel>  {
    return this.http.post<ResponseModel>(`${this.baseUrl}/uploadSeguros?usuarioGestor=${usuarioGestor}`, formData);
  }
}
