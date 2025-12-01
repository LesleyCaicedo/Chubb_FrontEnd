import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asegurado as AseguradoService } from '../../../../services/asegurado';
import { Paginador } from '../../../../components/paginador/paginador';
import { FiltradoModel } from '../../../../models/filtrado.model';


@Component({
  selector: 'app-modal-seguros',
  imports: [CommonModule, Paginador],
  templateUrl: './modal-seguros.html',
  styleUrl: './modal-seguros.css',
})
export class ModalSeguros implements OnChanges {
  @Input() id: number = 0;
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;
  listaSeguros: any[] = [];

  filtros: FiltradoModel = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 5 // Cambiar esto si se cambia el valor por defecto en el select del html
  };

  constructor(private aseguradoService: AseguradoService) { }

  ngOnChanges(): void {
    if (this.id) {
      const modal = document.getElementById('modal_ver_seguros') as HTMLDialogElement;
      this.obtenerSeguros();
      modal?.show();
    }
  }

  obtenerSeguros() {
    this.aseguradoService.obtenerSeguros(this.filtros, this.id).subscribe({
      next: (resp: any) => {
        this.listaSeguros = resp.datos.asegurado.map((element: any) => ({
          nombreSeguro: element.nombreSeguro,
          codigoSeguro: element.codigoSeguro
        }));

      }
    });
  }


  onPageChange(num: number) {
    this.filtros.paginaActual = num;
    this.obtenerSeguros();
  }

  closeModal() {
    const modal = document.getElementById('modal_ver_seguros') as HTMLDialogElement;
    modal.close();
  }
}
