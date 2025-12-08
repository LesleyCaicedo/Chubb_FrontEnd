import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  obtenerAsegurados(filtros: FiltradoModel): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/ConsultarAsegurados`, filtros);
  }

  obtenerSeguros(filtros: FiltradoModel, id: number): Observable<ResponseModel> {
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

  cargaMasiva(formData: FormData, usuarioGestor: string, reglas?: any[]): Observable<any> {
    let params = new HttpParams().set('usuarioGestor', usuarioGestor);

    if (reglas && reglas.length > 0) {
      params = params.set('reglasJson', JSON.stringify(reglas));
    }

    return this.http.post(`${this.baseUrl}/upload`, formData, { params });
  }
}
