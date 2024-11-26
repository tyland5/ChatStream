import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class CreateAccountService {
    constructor(private http:HttpClient){}

    checkUsernameAvailable(username: string){
        const usernameAvailable = new Subject<boolean>();

        this.http.get<{available:boolean}>(environment.apiBaseUrl + '/check-username-available', {responseType:"json", withCredentials: true, params:{username:username}}).subscribe(response =>{
            usernameAvailable.next(response.available)
        })

        return usernameAvailable.asObservable();
    }

    checkEmailInUse(email: string){
        return this.http.get<{available:boolean}>(environment.apiBaseUrl + '/check-email-used',  {responseType:"json", withCredentials: true, params:{email:email}})
    }

    // need this for the fork join in create-account
    checkUsernameAvailable2(username: string){
        return this.http.get<{available:boolean}>(environment.apiBaseUrl + '/check-username-available', {responseType:"json", withCredentials: true, params:{username:username}})
    }

    createUser(username:string, name:string, password: string, email: string){
        const userCreated = new Subject<boolean>();

        this.http.post<{inserted:boolean}>(environment.apiBaseUrl + '/create-user', {username:username, name:name, password:password, email:email}, {responseType:"json", withCredentials: true})
        .subscribe(response =>{
            userCreated.next(response.inserted)
        })

        return userCreated.asObservable();
    }
}