import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../interfaces/interfaces";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Router} from "@angular/router";

@Injectable({
    providedIn: 'root',
  })
  export class PersonalUserInfoService{
    userPfp: BehaviorSubject<string> = new BehaviorSubject('');
    loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private http:HttpClient, private router: Router){
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

    updateLoggedIn(newVal: boolean){
      this.loggedIn.next(newVal)
    }

    checkLoggedIn(path: string){
      const canActivate = new Subject<boolean>();
      this.http.get<boolean>('http://localhost:8080/check-logged-in', {responseType:"json", withCredentials: true}).subscribe(sessionExists=>{
        
        // if user not logged in and at login, let them go. we need to flip the boolean
        const isLoggedIn = path === "login" ? !sessionExists : sessionExists
        canActivate.next(isLoggedIn)

        if(this.loggedIn.value !== sessionExists){
          this.loggedIn.next(sessionExists)
        }

      
        // if logged in user at login, navigate to chat-tab. if not logged in user in the web app, navigate them to login
        if(path === "login"){
          if(sessionExists){
            this.router.navigate(["/chat-tab"])
          }
        }
        else{
          if(!sessionExists){
            this.router.navigate(["/login"])
          }
        }
          
    
      })

      return canActivate.asObservable();
    }

    logoutUser(){
      let signedOut = new Subject<boolean>();

      this.http.delete<boolean>('http://localhost:8080/logout', {withCredentials: true, responseType: "json"}).subscribe(succesfullyLoggedOut =>{
          if(succesfullyLoggedOut){
              this.updateLoggedIn(false)
          }
          signedOut.next(succesfullyLoggedOut)
      })

      return signedOut.asObservable();
  }
  }