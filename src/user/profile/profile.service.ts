import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { User } from '../../interfaces/interfaces';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
    csrf = localStorage.getItem("csrf") as string

    constructor(private http:HttpClient, private personalUserInfoService: PersonalUserInfoService){}

    updateUserInfo(username:string, name:string,  userInfo?: User, oldPfp?: string, newPfp?: string, newPfpName?: string){
      const infoUpdated = new Subject<boolean>();

      if(userInfo){
        this.http.put<{newPfpUrl:string}>(environment.apiBaseUrl + '/update-profile', {username: username, name: name, oldPfp: oldPfp, newPfp: newPfp, newPfpName: newPfpName}, 
          {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}}).subscribe(response => {
            if(response.newPfpUrl !== ''){
              this.personalUserInfoService.updateUserPfp(response.newPfpUrl)
              userInfo.pfp = response.newPfpUrl
              infoUpdated.next(true)
            }
            infoUpdated.next(false)
        })
      }

      else{
        this.http.put<{inserted:string}>(environment.apiBaseUrl + '/update-profile', {username: username, name: name}, 
          {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}}).subscribe(response => {
          infoUpdated.next(response.inserted ===  "true")
        })
      }
      
      return infoUpdated.asObservable()
    }
}