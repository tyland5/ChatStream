import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { Router } from "@angular/router";
import { Observable, Subject} from "rxjs";
import { PersonalUserInfoService } from "./personalUserinfo.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable({
    providedIn: 'root',
  })
  export class AuthGuard implements CanActivate {
    constructor(private personalUserInfoService: PersonalUserInfoService, private router: Router) {}
  
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      return this.personalUserInfoService.checkLoggedIn(route.url[0].path)
    }
  }