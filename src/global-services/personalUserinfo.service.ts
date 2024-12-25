import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../interfaces/interfaces";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Router} from "@angular/router";
import { environment } from "../environments/environment";

@Injectable({
    providedIn: 'root',
  })
  export class PersonalUserInfoService{
    userInfo: BehaviorSubject<User> = new BehaviorSubject({} as User);
    csrf: BehaviorSubject<string>  = new BehaviorSubject("")
    loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private http:HttpClient, private router: Router){
      // if user refreshes, get prior csrf. If user altered it, then would fail when trying to make post request
      let restoredCsrf: string | null = localStorage.getItem("csrf")
      if(restoredCsrf !== null){
        this.csrf.next(restoredCsrf)
      }
      
      // recover user info
      this.getPersonalUserInfo().subscribe(info=>{
        this.userInfo.next(info)
      })
    }

    setCsrf(csrf:string){
      this.csrf.next(csrf)
    }

    updateUserPfp(url: string){
        this.userInfo.next({...this.userInfo.value, pfp:url})
    }

    updateUserInfo(info: User){
      this.userInfo.next(info)
    }

    updateLoggedIn(newVal: boolean){
      this.loggedIn.next(newVal)
    }

    getPersonalUserInfo(){
      const userInfo = new Subject<User>();

      this.http.get<{uinfo: User}>(environment.apiBaseUrl + '/get-personal-info',{responseType:"json", withCredentials: true} )
      .subscribe(response => {
        userInfo.next(response.uinfo)
      })

      return userInfo.asObservable()
    }

    checkLoggedIn(path: string){
      const canActivate = new Subject<boolean>();
      
      this.http.post<{loggedIn:boolean}>(environment.apiBaseUrl + '/check-logged-in', {}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf.value}}).subscribe(response=>{
        const sessionExists = response.loggedIn

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

      this.http.delete<{loggedOut: boolean}>(environment.apiBaseUrl + '/logout', {withCredentials: true, responseType: "json"}).subscribe(response =>{
        const succesfullyLoggedOut = response.loggedOut
          
        if(succesfullyLoggedOut){
              this.updateLoggedIn(false)
          }
          signedOut.next(succesfullyLoggedOut)
      })

      return signedOut.asObservable();
  }
  }