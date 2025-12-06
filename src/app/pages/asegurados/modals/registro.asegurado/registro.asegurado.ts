import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AseguradoModel } from '../../../../models/asegurado.model';
import { SeguroModel } from '../../../../models/seguro.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asegurado } from '../../../../services/asegurado';
import { Seguro } from '../../../../services/seguro';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroInformationCircle, heroMagnifyingGlass, heroUser, heroXMark } from '@ng-icons/heroicons/outline';
import { Shareds } from '../../../../commons/utils/shared.util';
import { AlertService } from '../../../../services/alert';

@Component({
  selector: 'app-registro-asegurado',
  imports: [...Shareds, NgIcon],
  templateUrl: './registro.asegurado.html',
  styleUrl: './registro.asegurado.css',
  providers: [provideIcons({
    heroMagnifyingGlass,
    heroUser,
    heroInformationCircle,
    heroXMark
  })]
})
export class RegistroAsegurado {

  @Input() aseguradoUpdt: AseguradoModel | null = null;
  @Output() submitEvent = new EventEmitter<boolean>();
  @ViewChild('modalDialog') modalDialog!: ElementRef<HTMLDialogElement>;

  aseguradoForm: FormGroup = new FormBuilder().group({});
  disable = false;

  segurosDisponibles: SeguroModel[] = [];
  segurosSeleccionados: number[] = [];
  cargandoSeguros = false;

  today: string = new Date().toISOString().split('T')[0];

  filtros = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 100
  };
  constructor(
    private fb: FormBuilder,
    private aseguradoService: Asegurado,
    private seguroService: Seguro,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.setEmptyForm();
    this.setupEdadCalculation();
    this.aseguradoForm.valueChanges.subscribe(val => {
      console.log('Valores actuales del formulario:', val);
      console.log('Estado del formulario:', this.aseguradoForm.status);
    });
  }


  ngOnChanges(): void {
    if (!this.aseguradoUpdt) return;
    this.obtenerSeguros();
  }

  setEmptyForm() {
    this.aseguradoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaNacimiento: ['', Validators.required],
      edad: [{ value: '', disabled: true }], // sin validators ya que se autocalcula
      seleccionarSeguros: [false],
      seguros: [[]]
    });
  }

  setupFormListeners(): void {
    this.aseguradoForm.get('seleccionarSeguros')?.valueChanges.subscribe(checked => {
      this.toggleSeguro(checked);
    });
  }

  setupEdadCalculation() {
    const fechaNacControl = this.aseguradoForm.get('fechaNacimiento');

    fechaNacControl?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);

        // setear edad al form
        this.aseguradoForm.get('edad')?.setValue(edad, { emitEvent: false });

        // refrescar el formulario
        this.aseguradoForm.updateValueAndValidity();
      } else {
        this.aseguradoForm.get('edad')?.setValue('', { emitEvent: false });
      }
    });
  }

  calcularEdad(fechaNacimiento: string | Date | null): number {
    if (!fechaNacimiento) return 0;
    const fecha = new Date(fechaNacimiento);
    if (isNaN(fecha.getTime())) return 0; // fecha inválida

    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }

    return edad;
  }


  onFechaNacimientoChange(event: any) {
    this.calcularEdad(event.target.value);
  }

  cargarSeguros() {
    this.cargandoSeguros = true;

    this.seguroService.ConsultarSeguros(this.filtros).subscribe({
      next: (response) => {
        this.segurosDisponibles = response?.datos?.seguros ?? [];
        this.cargandoSeguros = false;
      },
      error: () => {
        this.segurosDisponibles = [];
        this.cargandoSeguros = false;
      }
    });
  }
  toggleSeguro(idSeguro: number) {
    const seguros: number[] = this.aseguradoForm.get('seguros')?.value || [];
    const index = seguros.indexOf(idSeguro);

    if (index > -1) {
      seguros.splice(index, 1);
    } else {
      seguros.push(idSeguro);
    }

    this.aseguradoForm.get('seguros')?.setValue(seguros);
    this.aseguradoForm.get('seguros')?.markAsTouched();
  }
  isSeguroSeleccionado(id: number) {
    return this.segurosSeleccionados.includes(id);
  }

  open(initialAsegurado?: AseguradoModel) {
    if (initialAsegurado) {
      this.aseguradoUpdt = initialAsegurado;
      this.ngOnChanges();
    } else {
      this.aseguradoUpdt = null;
      this.setEmptyForm();
      this.segurosSeleccionados = [];
    }

    this.modalDialog?.nativeElement.showModal();
    this.cargarSeguros();
  }

  closeModal() {
    this.modalDialog.nativeElement.close();
    this.aseguradoUpdt = null;
    this.segurosSeleccionados = [];
    this.setEmptyForm();
  }
  onSubmit() {
    if (!this.aseguradoForm.valid) {
      Object.keys(this.aseguradoForm.controls).forEach(k => {
        this.aseguradoForm.get(k)?.markAsTouched();
      });
      return;
    }
    console.log('onSubmit ejecutado', this.aseguradoForm.value);

    if (this.aseguradoUpdt) this.ActualizarAsegurado();
    else this.RegistrarAsegurado();
  }

  RegistrarAsegurado() {
    const form = this.aseguradoForm.getRawValue();

    const asegurado: AseguradoModel = {
      idAsegurado: this.aseguradoUpdt?.idAsegurado ?? 0,
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      eliminado: form.eliminado,
      seguros: form.seguros
    };

    this.aseguradoService.RegistrarAsegurado(asegurado).subscribe({
      next: () => {
        this.closeModal();
        this.submitEvent.emit(true);
      },
      error: (error) => {
        console.error('Error al actualizar seguro:', error);
        const mensaje = error?.error?.mensaje || 'No se pudo registrar al asegurado';
        this.submitEvent.emit(false);
        this.alertService.error('Error', mensaje);
      }
    });
  }


  ActualizarAsegurado() {
    const form = this.aseguradoForm.getRawValue();

    const asegurado: AseguradoModel = {
      idAsegurado: this.aseguradoUpdt!.idAsegurado,
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      eliminado: form.eliminado,
      seguros: form.seguros
    };

    this.aseguradoService.ActualizarAsegurado(asegurado).subscribe({
      next: () => {
        this.closeModal();
        this.submitEvent.emit(true);
      },
      error: () => this.submitEvent.emit(false)
    });
  }

  obtenerSeguros() {
    this.aseguradoService.obtenerSeguros(this.filtros, this.aseguradoUpdt!.idAsegurado).subscribe({
      next: (res: any) => {
        if (res.datos.asegurado.length) {
          this.aseguradoForm.patchValue({
            nombre: res.datos.asegurado[0].nombre,
            cedula: res.datos.asegurado[0].cedula,
            telefono: res.datos.asegurado[0].telefono,
            fechaNacimiento: res.datos.asegurado[0].fechaNacimiento
          })
          const edadCalc = this.calcularEdad(res.datos.asegurado[0].fechaNacimiento);
          this.aseguradoForm.get('edad')?.setValue(edadCalc, { emitEvent: false });
          this.segurosSeleccionados = res.datos.asegurado.map((s: any) =>
            typeof s === 'object' ? s.idSeguro : s
          );
          this.aseguradoForm.patchValue({
            seguros: this.segurosSeleccionados,
            seleccionarSeguros: true
          });
        } else {
          this.aseguradoForm.patchValue({
            nombre: this.aseguradoUpdt!.nombre,
            cedula: this.aseguradoUpdt!.cedula,
            telefono: this.aseguradoUpdt!.telefono,
            fechaNacimiento: this.aseguradoUpdt!.fechaNacimiento
          });
          const edadCalc = this.calcularEdad(this.aseguradoUpdt!.fechaNacimiento);
          this.aseguradoForm.get('edad')?.setValue(edadCalc, { emitEvent: false });
        }
      },
      error: () => this.submitEvent.emit(false)
    })
  }


  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) event.preventDefault();
  }

  onlyLetters(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

    if (!regex.test(char) && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  onKeyDown(event: KeyboardEvent) { }
}
