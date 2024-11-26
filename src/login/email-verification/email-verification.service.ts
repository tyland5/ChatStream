import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class EmailVerificationService {
    constructor(private http:HttpClient){}

    sendVerificationCodeRegister(recipientEmail: string, verificationCode: string){
        const emailSent = new Subject<boolean>();
        
        this.http.post<{sent:boolean}>(environment.apiBaseUrl + '/send-verif-email-register', {recipientEmail: recipientEmail, verificationCode: verificationCode}, {responseType:"json", withCredentials: true})
        .subscribe(response =>{
            emailSent.next(response.sent)
        })

        return emailSent.asObservable();
    }

    sendVerificationCodeForgotPW(recipientEmail: string, verificationCode: string){
        const emailSent = new Subject<boolean>();
        
        this.http.post<{sent:boolean}>(environment.apiBaseUrl + '/send-verif-email-forgot-pw', {recipientEmail: recipientEmail, verificationCode: verificationCode}, {responseType:"json", withCredentials: true})
        .subscribe(response =>{
            emailSent.next(response.sent)
        })

        return emailSent.asObservable();
    }
}