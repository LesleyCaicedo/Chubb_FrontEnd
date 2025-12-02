import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroUser, heroInformationCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { Shareds } from '../../../../commons/utils/shared.util';
import { SeguroModel } from '../../../../models/seguro.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Seguro } from '../../../../services/seguro';
import { AlertService } from '../../../../services/alert';

@Component({
  selector: 'app-registro-seguro',
  imports: [...Shareds, NgIcon],
  templateUrl: './registro.seguro.html',
  styleUrl: './registro.seguro.css',
  providers: [provideIcons({
    heroMagnifyingGlass,
    heroUser,
    heroInformationCircle,
    heroXMark
  })]
})
export class RegistroSeguro implements OnInit, OnChanges {
  @Input() seguroUpdt: SeguroModel | null = null;
  @Output() submitEvent = new EventEmitter<boolean>();
  seguroForm: FormGroup<any> = new FormBuilder().group({});
  disable: boolean = false;

  constructor(private fb: FormBuilder, private seguroService: Seguro, private alertService: AlertService) {}

  ngOnInit(): void {
    this.setEmptyForm();
    this.setupFormListeners();
  }

  ngOnChanges(): void {
    if (this.seguroUpdt) {
      this.seguroForm.patchValue({
        nombre: this.seguroUpdt.nombre,
        codigo: this.seguroUpdt.codigo,
        sumaAsegurada: this.seguroUpdt.sumaAsegurada,
        rangoEdad: !!(this.seguroUpdt.edadMin || this.seguroUpdt.edadMax),
        edadMin: this.seguroUpdt.edadMin,
        edadMax: this.seguroUpdt.edadMax
      });

      if (this.seguroUpdt.edadMin || this.seguroUpdt.edadMax) {
        this.toggleEdadFields(true);
      }

      const modal = document.getElementById('modal_registro_seguro') as HTMLDialogElement;
      modal?.show();
    }
  }

  //------ Validadores --------
  setEmptyForm() {
    this.seguroForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      sumaAsegurada: ['', [Validators.required, Validators.min(0)]],
      prima: [{ value: '', disabled: true }],
      rangoEdad: [false],
      edadMin: [{ value: '', disabled: true }],
      edadMax: [{ value: '', disabled: true }]
    });
  }

  setupFormListeners(): void {
    this.seguroForm.get('rangoEdad')?.valueChanges.subscribe(checked => {
      this.toggleEdadFields(checked);
    });

    this.seguroForm.get('sumaAsegurada')?.valueChanges.subscribe(() => {
      this.updatePrima();
    });

    this.seguroForm.get('edadMin')?.valueChanges.subscribe(() => {
      this.seguroForm.get('edadMax')?.updateValueAndValidity();
    });
  }

  toggleEdadFields(enabled: boolean): void {
    const edadMinControl = this.seguroForm.get('edadMin');
    const edadMaxControl = this.seguroForm.get('edadMax');

    if (enabled) {
      edadMinControl?.enable();
      edadMaxControl?.enable();
      edadMinControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      edadMaxControl?.setValidators([Validators.required, this.edadMaxValidator.bind(this)]);
    } else {
      edadMinControl?.disable();
      edadMaxControl?.disable();
      edadMinControl?.clearValidators();
      edadMaxControl?.clearValidators();
      edadMinControl?.setValue('');
      edadMaxControl?.setValue('');
    }

    edadMinControl?.updateValueAndValidity();
    edadMaxControl?.updateValueAndValidity();
  }

  edadMaxValidator(control: any): { [key: string]: boolean } | null {
    const edadMin = this.seguroForm?.get('edadMin')?.value;
    const edadMax = control.value;

    if (edadMin && edadMax && parseInt(edadMax) <= parseInt(edadMin)) {
      return { mayorQueMin: true };
    }
    return null;
  }

  calcularPrima(): number {
    const sumaAsegurada = this.seguroForm.get('sumaAsegurada')?.value;
    if (sumaAsegurada && sumaAsegurada > 0) {
      return sumaAsegurada * 0.05; 
    }
    return 0;
  }

  updatePrima(): void {
    const primaCalculada = this.calcularPrima();
    this.seguroForm.get('prima')?.setValue(primaCalculada, { emitEvent: false });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onSubmit() {
    const isFormValid = this.isFormValid();
    
    if (isFormValid) {
      if (!this.seguroUpdt) this.RegistrarSeguro();
      else this.ActualizarSeguro();
    } else {
      Object.keys(this.seguroForm.controls).forEach(key => {
        const control = this.seguroForm.get(key);
        if (control?.enabled) {
          control.markAsTouched();
        }
      });
    }
  }

  isFormValid(): boolean {
    const controls = this.seguroForm.controls;
    
    if (!controls['nombre'].value || !controls['codigo'].value || !controls['sumaAsegurada'].value) {
      return false;
    }

    if (controls['rangoEdad'].value) {
      const edadMin = controls['edadMin'].value;
      const edadMax = controls['edadMax'].value;
      
      if (!edadMin || !edadMax) {
        return false;
      }
      
      if (parseInt(edadMax) <= parseInt(edadMin)) {
        return false;
      }
    }

    return true;
  }

  RegistrarSeguro() {
    const formValue = this.seguroForm.getRawValue();
    
    const seguroData: SeguroModel = {
      nombre: formValue.nombre,
      codigo: formValue.codigo,
      sumaAsegurada: formValue.sumaAsegurada,
      prima: this.calcularPrima(), 
      edadMin: formValue.rangoEdad && formValue.edadMin ? formValue.edadMin : null,
      edadMax: formValue.rangoEdad && formValue.edadMax ? formValue.edadMax : null
    } as SeguroModel;

    this.seguroService.RegistrarSeguro(seguroData).subscribe({
      next: _ => {
        this.closeModal();
        this.submitEvent.emit(true);
      },
      error: (error) => {
        console.error('Error al registrar seguro:', error);
        const mensaje = error?.error?.mensaje || 'No se pudo registrar el seguro';
        this.submitEvent.emit(false);
        this.alertService.error('Error', mensaje);
      }
    });
  }

  ActualizarSeguro() {
    const formValue = this.seguroForm.getRawValue();
    
    let seguroData: SeguroModel = {
      idSeguro: this.seguroUpdt!.idSeguro,
      nombre: formValue.nombre,
      codigo: formValue.codigo,
      sumaAsegurada: formValue.sumaAsegurada,
      prima: this.calcularPrima(), // Usar la prima calculada
      edadMin: formValue.rangoEdad && formValue.edadMin ? formValue.edadMin : null,
      edadMax: formValue.rangoEdad && formValue.edadMax ? formValue.edadMax : null
    } as SeguroModel;

    this.seguroService.ActualizarSeguro(seguroData).subscribe({
      next: _ => {
        this.closeModal();
        this.submitEvent.emit(true);
      },
      error: (error) => {
        console.error('Error al actualizar seguro:', error);
        const mensaje = error?.error?.mensaje || 'No se pudo actualizar el seguro';
        this.submitEvent.emit(false);
        this.alertService.error('Error', mensaje);
      }
    });
  }

  closeModal() {
    this.seguroUpdt = null;

    const modal = document.getElementById('modal_registro_seguro') as HTMLDialogElement;
    modal.close();

    this.setEmptyForm();
    this.setupFormListeners(); 
  }
}