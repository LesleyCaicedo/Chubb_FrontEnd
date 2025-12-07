import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Seguros } from './pages/seguros/seguros';
import { Asegurados } from './pages/asegurados/asegurados';
import { Login } from './pages/login/login';
import { authGuard } from './commons/guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '', runGuardsAndResolvers: 'always', canActivate: [authGuard],
        children: [
            { path: '', component: Home },
            { path: 'seguros', component: Seguros },
            { path: 'asegurados', component: Asegurados }
        ]
    }
];
