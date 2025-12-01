import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Spinner as SpinnerService } from '../../services/spinner';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  isLoading$: Observable<boolean>;
  
  constructor(private spinnerService: SpinnerService) { 
    this.isLoading$ = this.spinnerService.loading$;
  }
}
