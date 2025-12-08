import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import Swal from 'sweetalert2'
import { Seguro as SeguroService} from '../../services/seguro';
import { CommonModule } from '@angular/common';
import { Account as AccountService } from '../../services/account';

@Component({
  selector: 'app-seguros-carga-masiva',
  imports: [CommonModule],
  templateUrl: './seguros-carga-masiva.html',
  styleUrl: './seguros-carga-masiva.css',
})
export class SegurosCargaMasiva {
  isDragging = false;
  selectedFile: File | null = null;
  usuarioGestor: string = '';
  
  @Output() submitEvent = new EventEmitter<boolean>();
  constructor(private http: HttpClient, private seguroService: SeguroService, private accountService: AccountService) 
  {
    this.usuarioGestor = this.accountService.obtenerSesion()?.nombre || 'usuario_default';
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    this.validateFile(file);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.validateFile(file);
  }

  validateFile(file: File) {
    const allowed = ['xlsx', 'xls', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowed.includes(extension)) {
      alert('Solo se permiten archivos Excel (.xlsx, .xls) o TXT.');
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.seguroService.cargaMasiva(formData, this.usuarioGestor).subscribe({
      next: (res) => {
        Swal.fire({
          title: "Archivo cargado correctamente",
          text: "",
          icon: "success"
        });

        this.selectedFile = null;
        this.closeModal();
        this.submitEvent.next(true);
      },
      error: (err) => {
        alert('Error al subir el archivo');
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modal = document.getElementById('modal_carga_masiva_seguro') as HTMLDialogElement;
    modal.close();
  }
}
