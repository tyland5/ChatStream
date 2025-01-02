import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { Router, RouterLink } from "@angular/router";
import { PersonalUserInfoService } from "../global-services/personalUserinfo.service";


@Component({
    selector: 'navbar',
    standalone: true,
    imports: [MatIconModule, MatMenuModule, CommonModule, RouterLink],
    templateUrl: './navbar.component.html'
  })
  export class NavBar {
    pfp: string;
    sidenavOpen:boolean = false;
    userMenuOpen:boolean = false;
    onMobile: boolean = window.innerWidth < 768;
    
    constructor(private router: Router, private personalUserInfoService: PersonalUserInfoService){   
        this.personalUserInfoService.userInfo.subscribe(newInfo => {
            this.pfp = newInfo.pfp
        })
    }

    navigateTo(routeName: string){
        this.sidenavOpen = false;
        this.router.navigate(['/' + routeName]);
      }
    
    logout(){
        this.personalUserInfoService.logoutUser().subscribe(loggedOut => {
          this.personalUserInfoService.updateLoggedIn(false)
          localStorage.clear()
          this.router.navigate(['/login'])
        })
    }

  }