import { Component, Input, OnChanges } from '@angular/core';
import { FiltradoModel } from '../../../../models/filtrado.model';
import { Seguro as SeguroService } from '../../../../services/seguro';
import { Paginador } from '../../../../components/paginador/paginador';
import { CommonModule } from '@angular/common';
import { ResponseModel } from '../../../../models/ResponseModel';

@Component({
  selector: 'app-vizualizar-asegurados',
  imports: [CommonModule, Paginador],
  templateUrl: './vizualizar.asegurados.html',
  styleUrl: './vizualizar.asegurados.css',
})
export class VizualizarAsegurados implements OnChanges{
@Input() id: number = 0;
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;
  listaAsegurados: any[] = [];

  filtros: FiltradoModel = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 5 // Cambiar esto si se cambia el valor por defecto en el select del html
  };

  constructor(private seguroService: SeguroService) { }

  ngOnChanges(): void {
    if (this.id) {
      const modal = document.getElementById('modal_ver_asegurados') as HTMLDialogElement;
      this.obtenerAsegurados();
      modal?.show();
    }
  }

  obtenerAsegurados() {
    this.seguroService.ConsultarSeguroId(this.filtros, this.id).subscribe({
      next: (resp: ResponseModel) => {
        this.listaAsegurados = resp.datos.seguros.map((element: any) => ({
          cedula: element.cedula,
          nombreAsegurado: element.nombre,
          edad: element.edad
        }));
      }
    });
  }

  onPageChange(num: number) {
    this.filtros.paginaActual = num;
    this.obtenerAsegurados();
  }

  closeModal() {
    const modal = document.getElementById('modal_ver_asegurados') as HTMLDialogElement;
    modal.close();
  }
}
