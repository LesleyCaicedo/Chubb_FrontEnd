import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginador',
  imports: [CommonModule],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {
  @Input() paginaActual: number = 1;
  @Input() tamanioPagina: number = 10;
  @Input() registrosTotales: number = 0;
  @Input() registrosFiltrados: number = 0;
  @Input() seFiltra: boolean = false;
  @Output() paginaCambiada = new EventEmitter<number>();

  totalPaginas: number = 1;
  paginas: number[] = [];
  tamanoBloque = 5;  

  ngOnChanges(): void {
    const total = this.registrosFiltrados || this.registrosTotales || 0;
    this.totalPaginas = Math.ceil(total / this.tamanioPagina) || 1;

    this.generarPaginas();
  }

  generarPaginas() {
    // Inicio del bloque de 5
    const inicioBloque =
      Math.floor((this.paginaActual - 1) / this.tamanoBloque) * this.tamanoBloque + 1;

    // Fin del bloque de 5
    const finBloque = Math.min(
      inicioBloque + this.tamanoBloque - 1,
      this.totalPaginas
    );

    this.paginas = [];
    for (let i = inicioBloque; i <= finBloque; i++) {
      this.paginas.push(i);
    }
  }

  cambiarPagina(num: number) {
    if (num >= 1 && num <= this.totalPaginas) {
      this.paginaActual = num;
      this.paginaCambiada.emit(num);
    }
  }

  get registroInicio(): number {
    if(this.registrosTotales === 0) return 0; 
    return (this.paginaActual - 1) * this.tamanioPagina + 1;
  }

  get registroFin(): number {
    const fin = this.paginaActual * this.tamanioPagina;
    return fin > this.registrosFiltrados ? this.registrosFiltrados : fin;
  }
}
