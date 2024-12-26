import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { User } from '../../interfaces/interfaces';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService implements OnDestroy {
    csrf: string
    personalUserInfoSubscription: Subscription

    constructor(private http:HttpClient, private personalUserInfoService: PersonalUserInfoService){
      this.personalUserInfoSubscription = this.personalUserInfoService.csrf.subscribe(csrf => this.csrf = csrf)
    }

    ngOnDestroy(): void {
      this.personalUserInfoSubscription.unsubscribe()
    }

    updateUserInfo(username:string, name:string,  userInfo?: User, oldPfp?: string, newPfp?: string, newPfpName?: string){
      const infoUpdated = new Subject<boolean>();

      if(userInfo){
        this.http.put<{newPfpUrl:string}>(environment.apiBaseUrl + '/update-profile', {username: username, name: name, oldPfp: oldPfp, newPfp: newPfp, newPfpName: newPfpName}, 
          {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}}).subscribe(response => {
            if(response.newPfpUrl !== ''){
              this.personalUserInfoService.updateUserInfo({...this.personalUserInfoService.userInfo.value, pfp: response.newPfpUrl, username:username, name:name})
              userInfo.pfp = response.newPfpUrl
              infoUpdated.next(true)
            }
            infoUpdated.next(false)
        })
      }

      else{
        this.http.put<{inserted:string}>(environment.apiBaseUrl + '/update-profile', {username: username, name: name}, 
          {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}}).subscribe(response => {
            if(response.inserted){
              this.personalUserInfoService.updateUserInfo({...this.personalUserInfoService.userInfo.value, username:username, name:name})
            }
           infoUpdated.next(response.inserted ===  "true")
        })
      }
      
      return infoUpdated.asObservable()
    }

    getBasicUserInfo(uids: string[]){
      const userInfo = new Subject<User[]>();

      this.http.get<{uinfo: User[]}>(environment.apiBaseUrl + '/update-profile',{responseType:"json", withCredentials: true, params:{uids:uids}} )
      .subscribe(response => {
        userInfo.next(response.uinfo)
      })

      return userInfo.asObservable()
    }
}