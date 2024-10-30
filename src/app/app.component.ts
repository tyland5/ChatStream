import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { LoginForm } from '../login/login-form/login-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginForm, RouterLink, MatIconModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: String = 'ChatStream';
  loggedIn: boolean = false; // this will also be used to conditionally render our header
  pfp: string;

  constructor(private router: Router){
    const uinfo: {pfp:string} = JSON.parse(localStorage.getItem('uinfo') as string)
    this.pfp = uinfo.pfp
  }

  navigateTo(routeName: string){
    this.router.navigate(['/' + routeName]);
  }
}
