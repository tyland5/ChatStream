import { Routes} from '@angular/router';
import { AppComponent } from './app.component';
import { LoginRoutes } from '../login/login-form/login.routes';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch: 'full'},
    {path:'home', loadComponent: () => import('../home/home.component').then(mod => mod.Home)},
    {path:'login',
        loadChildren: () => import('../login/login-form/login.routes').then(mod=> mod.LoginRoutes)
    },
    {path:'chat-tab',
        loadComponent: () => import('../chat/chat-list/chat-list.component').then(mod => mod.ChatList)
    }
];
