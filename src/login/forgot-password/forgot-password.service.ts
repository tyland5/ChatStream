import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class ForgotPasswordService {
    constructor(private http:HttpClient){}

    changePassword(email:string, password: string){
        const passwordChanged = new Subject<boolean>()

        this.http.put<{updated:boolean}>(environment.apiBaseUrl + '/change-password', {email:email, password:password}, {responseType:"json"})
        .subscribe(response=>{
            passwordChanged.next(response.updated)
        })

        return passwordChanged.asObservable()
    }
}
