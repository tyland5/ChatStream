import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmailVerification } from '../email-verification/email-verification.component';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { CreateAccountService } from '../create-account/create-account.service';
import { ForgotPasswordService } from './forgot-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, EmailVerification],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPassword{
  pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,16}$/
  email: string = "";
  password: string ="";
  confirmPassword: string = "";
  showConfirmCodeScreen: boolean = false;

  showEmailErr: boolean = false;
  showEmailNonexistentErr: boolean = false;
  showPasswordErr: boolean = false;
  showConfirmPasswordErr: boolean = false;

  constructor(private registerService: CreateAccountService, private forgotPasswordService: ForgotPasswordService, private router: Router){}

  checkFormInfo(){
    this.showEmailErr = false;
    this.showEmailNonexistentErr = false;
    this.showPasswordErr = false;
    this.showConfirmPasswordErr= false;
    let numErr = 0

    if (this.email.length == 0 || !this.email.match(/\S+@\S+\.\S+/) ){
      numErr += 1
      this.showEmailErr = true
    }

    if(!this.pwRegex.test(this.password)){
      numErr += 1
      this.showPasswordErr = true
    }

    if(this.confirmPassword !== this.password){
      numErr += 1
      this.showConfirmPasswordErr = true
    }


    this.registerService.checkEmailInUse(this.email).subscribe(response => {
      // email doesnt exist
      if(response.available){
        numErr +=1
        this.showEmailNonexistentErr = true
      }

      if(numErr === 0){
        this.showConfirmCodeScreen = true
      }
    })
  }

  changedPassword(event:boolean){
    this.forgotPasswordService.changePassword(this.email, this.password).subscribe(updated=>{
      if(updated){
        this.router.navigate(["/login"])
      }
    })
  }
}
