import { Routes} from '@angular/router';
import { ChatTabService } from '../chat/chat-tab/chat-tab.service';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch: 'full'},
    {path:'home', loadComponent: () => import('../home/home.component').then(mod => mod.Home)},
    {path:'login',
        loadChildren: () => import('../login/login-form/login.routes').then(mod=> mod.LoginRoutes)
    },
    {path:'chat-tab',
        providers: [ChatTabService],
        loadComponent: () => import('../chat/chat-tab/chat-tab.component').then(mod => mod.ChatTab)
    }
];
