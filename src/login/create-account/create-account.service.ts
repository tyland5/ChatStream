import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class CreateAccountService {
    constructor(private http:HttpClient){}

    checkUsernameAvailable(username: string){
        const usernameAvailable = new Subject<boolean>();

        this.http.get<{available:boolean}>('http://localhost:8080/check-username-available', {responseType:"json", withCredentials: true, params:{username:username}}).subscribe(response =>{
            usernameAvailable.next(response.available)
        })

        return usernameAvailable.asObservable();
    }

    checkEmailInUse(email: string){
        return this.http.get<{available:boolean}>('http://localhost:8080/check-email-used',  {responseType:"json", withCredentials: true, params:{email:email}})
    }

    // need this for the fork join in create-account
    checkUsernameAvailable2(username: string){
        return this.http.get<{available:boolean}>('http://localhost:8080/check-username-available', {responseType:"json", withCredentials: true, params:{username:username}})
    }

    createUser(username:string, name:string, password: string, email: string){
        const userCreated = new Subject<boolean>();

        this.http.post<{inserted:boolean}>('http://localhost:8080/create-user', {username:username, name:name, password:password, email:email}, {responseType:"json", withCredentials: true})
        .subscribe(response =>{
            userCreated.next(response.inserted)
        })

        return userCreated.asObservable();
    }
}