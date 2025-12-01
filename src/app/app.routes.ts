import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Seguros } from './pages/seguros/seguros';
import { Asegurados } from './pages/asegurados/asegurados';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'seguros', component: Seguros },
    { path: 'asegurados', component: Asegurados }
];
