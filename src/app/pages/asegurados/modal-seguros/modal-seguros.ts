import { Component } from '@angular/core';
import { FiltradoModel } from '../../../models/filtrado.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-seguros',
  imports: [CommonModule],
  templateUrl: './modal-seguros.html',
  styleUrl: './modal-seguros.css',
})
export class ModalSeguros {
  listaSeguros: any;
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;
  
  filtros: FiltradoModel = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 10 // Cambiar esto si se cambia el valor por defecto en el select del html
  };
}
