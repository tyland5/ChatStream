import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class Profile implements OnInit{
  title: String = 'ChatStream';
  loggedIn: boolean = false; // this will also be used to conditionally render our header
  hoveredPfp: boolean =false;
  usernameUnavailableErr: boolean = false;
  infoSaved: boolean = false;
  userInfo: {pfp: string, username: string, name: string};

  constructor(private profileService: ProfileService){}

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem('uinfo') as string)
  }

  onNameChange(event: Event){
    const newName = (event.target as HTMLInputElement).value;
    this.userInfo.name = newName;
  }

  // check if alphanumeric (minus capitals) and if a _ or . which are the only valid non alphanumeric
  checkIfValidChar(event: KeyboardEvent): boolean{
    const char = event.key
    
    const isAlphanumeric = /^[a-z0-9]$/.test(char) // if want capitals, add A-Z
    
    const valid = isAlphanumeric || char === "." || char === "_" ||  char ===""

    return valid
  }

  saveProfileChanges(){
    this.usernameUnavailableErr = false

    if(this.userInfo.username === "" || this.userInfo.name ===""){
      return
    }

    this.profileService.checkUsernameAvailable(this.userInfo.username).subscribe(isAvailable=>{
      if(!isAvailable){
        this.usernameUnavailableErr = true
        return
      }

      this.profileService.updateUserInfo(this.userInfo.username, this.userInfo.name, this.userInfo.pfp).subscribe(inserted=>{
        if(!inserted){
          return
        }

        this.infoSaved = true
        localStorage.setItem("uinfo", JSON.stringify(this.userInfo))
      })
    })
  }

}
