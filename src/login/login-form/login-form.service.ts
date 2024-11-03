import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, pipe, catchError, throwError} from 'rxjs';
import { LoginJsonResponse } from '../../interfaces/interfaces';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Injectable({
  providedIn: 'root',
})
export class LoginFormService {
    constructor(private http:HttpClient, private personalUserInfoService: PersonalUserInfoService){}

    checkCredentials(uname: string, pw: string){
        let isValid = new Subject<boolean>();
        
        // MAKE SURE WITH CREDENTIALS IS THERE OR CROSS SITE COOKIES WONT BE ALLOWED
        this.http.get<LoginJsonResponse>('http://localhost:8080/check-credentials', {params: {username: uname, password: pw}, responseType: "json", withCredentials: true})
        .pipe(catchError(error => {
            if(error.status == 401){
                isValid.next(false)
            }
            return throwError("invalid credentials")
        }))
        .subscribe((response: LoginJsonResponse) => {
            localStorage.setItem("csrf", response.csrf)
            localStorage.setItem("uid", response.uid)
            localStorage.setItem("uinfo", JSON.stringify({name: response.name, username: response.username, pfp: response.pfp}))
            this.personalUserInfoService.updateUserPfp(response.pfp)
            isValid.next(true) // you publish changes to the subscriber
        });

        return isValid.asObservable();
    }

    logoutUser(){
        let signedOut = new Subject<boolean>();

        this.http.delete<boolean>('http://localhost:8080/logout', {withCredentials: true, responseType: "json"}).subscribe(succesfullyLoggedOut =>{
            if(succesfullyLoggedOut){
                this.personalUserInfoService.updateLoggedIn(false)
            }
            signedOut.next(succesfullyLoggedOut)
        })

        return signedOut.asObservable();
    }
}