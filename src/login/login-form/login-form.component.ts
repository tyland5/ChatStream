import { Component} from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LoginFormService } from './login-form.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login-form.component.html',
})
export class LoginForm {

  username: string = ""
  password: string = ""
  showIncorrectCred = false

  constructor(private loginService: LoginFormService, private router: Router){}

  loginClicked(){
    this.loginService.checkCredentials(this.username, this.password).subscribe(isValidUser=>{
      if(isValidUser == true){
        this.router.navigate(['/chat-tab']);
      }
      else{
        this.showIncorrectCred = true;
      }
    })
  }
}
