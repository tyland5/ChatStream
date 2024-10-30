import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { User } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

    constructor(private http:HttpClient){}

    
    checkUsernameAvailable(username: string){
      const usernameAvailable = new Subject<boolean>();

      this.http.get<{available:boolean}>('http://localhost:8080/check-username-available', {responseType:"json", withCredentials: true, params:{username:username}}).subscribe(response =>{
        usernameAvailable.next(response.available)
      })

      return usernameAvailable.asObservable();
    }

    updateUserInfo(username:string, name:string, pfp: string){
      const infoUpdated = new Subject<boolean>();
      this.http.put<{inserted:boolean}>('http://localhost:8080/update-profile', {username: username, name: name, pfp: pfp}, {responseType:"json", withCredentials: true}).subscribe(response => {
        infoUpdated.next(response.inserted)
      })
      return infoUpdated.asObservable()
    }
}