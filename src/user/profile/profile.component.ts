import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { User } from '../../interfaces/interfaces';
import { CreateAccountService } from '../../login/create-account/create-account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './profile.component.html',
})
export class Profile implements OnInit{
  userInfo: User; // pfp should be updated with new pfp url 
  hoveredPfp: boolean =false;
  usernameUnavailableErr: boolean = false;
  infoSaved: boolean = false;

  editingImage: boolean = false; // // toggle to only show cropping section
  imageChangedEvent: Event | null = null; // triggers rendering cropper
  croppedImage: {url: SafeUrl, blob: Blob} = {url:'', blob: new Blob()}; // temporary variable in the cropping screen. final values go to newPfp and newPfpBase64
  newPfp: SafeUrl = ''; // for displaying on profile 
  newPfpBase64: string = ''; // this is base4 of cropped new pfp thats sent to backend

  constructor(private profileService: ProfileService, private sanitizer: DomSanitizer, private registerService: CreateAccountService ){}

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem('uinfo') as string)
  }

  onFileChange(event: Event){
    this.imageChangedEvent = event;
    this.editingImage = true;
  }

  onImageCropped(event: ImageCroppedEvent){
    this.croppedImage.blob = event.blob as Blob;
    this.croppedImage.url = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl as string);
  }

  cancelPfpChange(){
    // can leave cropped image alone. reinitialized when cropper opens anyways
    this.editingImage = false
    this.hoveredPfp = false
  }

  savePfpChange(){
    this.editingImage = false; 
    this.hoveredPfp = false;
    this.newPfp = this.croppedImage.url;

    // get base64 representation of cropped new pfp
    const reader = new FileReader();
    reader.onload = () => {
      this.newPfpBase64 = reader.result as string;
    };
    reader.readAsDataURL(this.croppedImage.blob);
  }

  // for username, check if alphanumeric (minus capital letters) and if a _ or . which are the only valid non alphanumeric
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

    // check if username is valid. if it is, then update user info in db
    this.registerService.checkUsernameAvailable(this.userInfo.username).subscribe(isAvailable=>{
      if(!isAvailable){
        this.usernameUnavailableErr = true
        return
      }

      // if a new cropped pfp has been selected
      if(this.newPfp !== ''){
        const newPfpName: string = localStorage.getItem("uid") as string + "pfp_" + Date.now().toString()

        this.profileService.updateUserInfo(this.userInfo.username, this.userInfo.name, this.userInfo, this.userInfo.pfp, this.newPfpBase64, newPfpName).subscribe(inserted=>{
          if(!inserted){
            return
          }

          // userinfo.pfp is updated in the updateUserInfo service call. so dont worry about it
          this.infoSaved = true
          localStorage.setItem("uinfo", JSON.stringify(this.userInfo))
        })
        return
      }

      // else no new cropped pfp
      this.profileService.updateUserInfo(this.userInfo.username, this.userInfo.name).subscribe(inserted=>{
        if(!inserted){
          return
        }

        this.infoSaved = true
        localStorage.setItem("uinfo", JSON.stringify(this.userInfo))
      })
    })
  }

}
