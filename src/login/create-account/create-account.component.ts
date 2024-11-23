import { Component } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailVerification } from '../email-verification/email-verification.component';
import { forkJoin } from 'rxjs';
import { CreateAccountService } from './create-account.service';

@Component({
  selector: 'create-account',
  standalone: true,
  imports: [CommonModule, FormsModule, EmailVerification],
  templateUrl: './create-account.component.html',
})
export class CreateAccount {
  pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,16}$/
  username: string = ""
  name: string = ""
  email: string = ""
  password: string = ""
  confirmPassword: string = ""
  verificationCode: string = ""
  infoChecked: boolean = false;

  showUsernameErr: boolean = false
  showUsernameUsedErr: boolean = false
  showNameErr: boolean = false
  showPasswordErr: boolean = false
  showConfirmPasswordErr: boolean = false
  showEmailErr: boolean = false
  showEmailUsedErr: boolean = false

  constructor(private registerService: CreateAccountService, private router: Router){}

  // check once user submits form
  checkUserInfo(){
    let numErr = 0
    
    this.showUsernameErr = false
    this.showNameErr = false
    this.showEmailErr = false
    this.showPasswordErr = false
    this.showConfirmPasswordErr = false
    this.showEmailUsedErr = false
    this.showUsernameUsedErr = false

    if(this.username.length === 0){
      numErr += 1
      this.showUsernameErr = true
    }
    if(this.name.length === 0){
      numErr += 1
      this.showNameErr = true
    }
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

    if(numErr !== 0){
      return
    }

    forkJoin([this.registerService.checkEmailInUse(this.email), this.registerService.checkUsernameAvailable2(this.username)]).subscribe(([res1, res2]) =>{
      if(!res1.available){
        this.showEmailUsedErr = true;
        numErr += 1
      }
      if(!res2.available){
        this.showUsernameUsedErr = true;
        numErr += 1
      }

      if(numErr === 0){
        this.infoChecked = true
      }
    })
  }

  // for username, check if alphanumeric (minus capital letters) and if a _ or . which are the only valid non alphanumeric
  checkIfValidChar(event: KeyboardEvent): boolean{
    const char = event.key
    
    const isAlphanumeric = /^[a-z0-9]$/.test(char) // if want capitals, add A-Z
    
    const valid = (isAlphanumeric || char === "." || char === "_" ||  char ==="") && this.username.length !== 31

    if(!valid){
      this.showUsernameErr = true
    }

    return valid
  }

  // prevents input of display name past 31 characters
  checkDisplayNameLength(event:KeyboardEvent): boolean{
    return !(this.name.length === 31)
  }

  // for (input). reason is we want to hide error when user types valid character
  changeUsername(event: Event){
    this.showUsernameErr = false
    this.username = (event.target as HTMLInputElement).value; 
  }

  createUser(event: boolean){
    this.registerService.createUser(this.username, this.name, this.password, this.email).subscribe(inserted => {
      if(inserted){
        this.router.navigate(["/login"])
      }
    })
  }
}
