import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { LoginForm } from '../login/login-form/login-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PersonalUserInfoService } from '../global-services/personalUserinfo.service';
import { CommonModule } from '@angular/common';
import { LoginFormService } from '../login/login-form/login-form.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginForm, RouterLink, MatIconModule, MatMenuModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: String = 'ChatStream';
  loggedIn: boolean = false; // this will also be used to conditionally render our header
  pfp: string;

  constructor(private router: Router, private personalUserInfoService: PersonalUserInfoService){    
    this.personalUserInfoService.userPfp.subscribe(newPfp => {
      this.pfp = newPfp
    })
    this.personalUserInfoService.loggedIn.subscribe(newState=>{
      this.loggedIn = newState
    })
  }

  navigateTo(routeName: string){
    this.router.navigate(['/' + routeName]);
  }

  logout(){
    this.personalUserInfoService.logoutUser().subscribe(loggedOut => {
      this.personalUserInfoService.updateLoggedIn(false)
      localStorage.clear()
      this.router.navigate(['/login'])
    })
  }
}
