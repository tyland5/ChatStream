import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { User } from '../../interfaces/interfaces';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

    constructor(private http:HttpClient, private personalUserInfoService: PersonalUserInfoService){}

    
    checkUsernameAvailable(username: string){
      const usernameAvailable = new Subject<boolean>();

      this.http.get<{available:boolean}>('http://localhost:8080/check-username-available', {responseType:"json", withCredentials: true, params:{username:username}}).subscribe(response =>{
        usernameAvailable.next(response.available)
      })

      return usernameAvailable.asObservable();
    }

    updateUserInfo(username:string, name:string,  userInfo?: User, oldPfp?: string, newPfp?: string, newPfpName?: string){
      const infoUpdated = new Subject<boolean>();

      if(userInfo){
        this.http.put<{newPfpUrl:string}>('http://localhost:8080/update-profile', {username: username, name: name, oldPfp: oldPfp, newPfp: newPfp, newPfpName: newPfpName}, 
          {responseType:"json", withCredentials: true}).subscribe(response => {
            if(response.newPfpUrl !== ''){
              this.personalUserInfoService.updateUserPfp(response.newPfpUrl)
              userInfo.pfp = response.newPfpUrl
              infoUpdated.next(true)
            }
            infoUpdated.next(false)
        })
      }

      else{
        this.http.put<{inserted:string}>('http://localhost:8080/update-profile', {username: username, name: name}, {responseType:"json", withCredentials: true}).subscribe(response => {
          infoUpdated.next(response.inserted ===  "true")
        })
      }
      
      return infoUpdated.asObservable()
    }
}