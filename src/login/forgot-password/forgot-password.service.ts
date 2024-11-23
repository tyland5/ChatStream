import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ForgotPasswordService {
    constructor(private http:HttpClient){}

    changePassword(email:string, password: string){
        const passwordChanged = new Subject<boolean>()

        this.http.put<{updated:boolean}>('http://localhost:8080/change-password', {email:email, password:password}, {responseType:"json"})
        .subscribe(response=>{
            passwordChanged.next(response.updated)
        })

        return passwordChanged.asObservable()
    }
}
