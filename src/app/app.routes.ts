import { Routes} from '@angular/router';
import { ChatTabService } from '../chat/chat-tab/chat-tab.service';
import { AuthGuard } from '../global-services/auth-guard.service';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch: 'full'},
    {path:'home', loadComponent: () => import('../home/home.component').then(mod => mod.Home)},
    {path:'login',
        loadChildren: () => import('../login/login-form/login.routes').then(mod=> mod.LoginRoutes),
        canActivate: [AuthGuard]
    },
    {path:'chat-tab',
        providers: [ChatTabService],
        loadComponent: () => import('../chat/chat-tab/chat-tab.component').then(mod => mod.ChatTab),
        canActivate: [AuthGuard]
    },
    {path:'profile', loadComponent: ()=> import('../user/profile/profile.component').then(mod=> mod.Profile),
        canActivate: [AuthGuard]
    },
    {path:'friends', loadComponent: ()=> import('../user/friends/friends.component').then(mod=> mod.Friends),
        canActivate: [AuthGuard]
    },
];
