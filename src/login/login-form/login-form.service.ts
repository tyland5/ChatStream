import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, pipe, catchError, throwError} from 'rxjs';
import { LoginJsonResponse } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class LoginFormService {
    constructor(private http:HttpClient){}

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
            isValid.next(true) // you publish changes to the subscriber
            localStorage.setItem("csrf", response.csrf)
            localStorage.setItem("uid", response.uid)
        });

        return isValid.asObservable();
    }
}