import { Component} from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ForgotPassword } from '../forgot-password/forgot-password.component';
import { LoginFormService } from './login-form.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [ForgotPassword, RouterLink, FormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginForm {

  username: string = ""
  password: string = ""

  constructor(private loginService: LoginFormService, private router: Router){}

  loginClicked(){
    this.loginService.checkCredentials(this.username, this.password).subscribe(isValidUser=>{
      if(isValidUser == true){
        this.router.navigate(['/chat-tab']);
      }
      else{
        console.log("invalid credentials")
      }
    })
  }
}
