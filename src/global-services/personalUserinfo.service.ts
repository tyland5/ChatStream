import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../interfaces/interfaces";

@Injectable({
    providedIn: 'root',
  })
  export class PersonalUserInfoService{
    userPfp: BehaviorSubject<string> = new BehaviorSubject('');
    
    constructor(){
      let uinfo: string | User = localStorage.getItem('uinfo') as string
      
      if(!uinfo){
        return
      }
      
      uinfo = JSON.parse(uinfo) as User
      this.userPfp.next(uinfo.pfp)
    }
    
    updateUserPfp(url: string){
        this.userPfp.next(url)
    }
  }