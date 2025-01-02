import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PersonalUserInfoService } from '../global-services/personalUserinfo.service';
import { CommonModule } from '@angular/common';
import { NavBar } from '../navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatMenuModule, CommonModule, NavBar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: String = 'ChatStream';
  loggedIn: boolean = false; // this will also be used to conditionally render our header

  constructor(private personalUserInfoService: PersonalUserInfoService){    
    this.personalUserInfoService.loggedIn.subscribe(newState=>{
      this.loggedIn = newState
    })
  }
}
