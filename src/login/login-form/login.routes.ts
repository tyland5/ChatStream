import { Routes } from '@angular/router';
import { ForgotPassword } from '../forgot-password/forgot-password.component';
import { LoginForm } from './login-form.component';
import { CreateAccount } from '../create-account/create-account.component';

export const LoginRoutes: Routes = [
    {path: '', component: LoginForm},
    {path: 'forgot-password', loadComponent: () => import('../forgot-password/forgot-password.component').then(mod => mod.ForgotPassword)},
    {path: 'create-account', loadComponent: () => import('../create-account/create-account.component').then(mod => mod.CreateAccount)}
];
