import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailVerificationService } from './email-verification.service';

@Component({
  selector: 'email-verification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './email-verification.component.html',
})
export class EmailVerification implements OnInit{
  @Input() recipientEmail: string;
  @Input() purpose: string;
  @Output() codeCheckResult = new EventEmitter<boolean>;
  verificationCode: string;
  inputtedCode: string = "";
  showWrongCodeErr: boolean = false;

  constructor(private emailVerificationService: EmailVerificationService){
    this.verificationCode = Math.random().toString(36).substring(2,8)
  }

  ngOnInit(): void {
    if(this.purpose ==="register"){
      this.emailVerificationService.sendVerificationCodeRegister(this.recipientEmail, this.verificationCode).subscribe(sent=>{console.log(sent)})
    }
    else{
      this.emailVerificationService.sendVerificationCodeForgotPW(this.recipientEmail, this.verificationCode).subscribe(sent=>{console.log(sent)})
    }
  }

  checkCode(){
    console.log(this.verificationCode)
    if(this.inputtedCode !== this.verificationCode){
      this.showWrongCodeErr = true
      return
    }

    this.codeCheckResult.emit(true)
  }
}
