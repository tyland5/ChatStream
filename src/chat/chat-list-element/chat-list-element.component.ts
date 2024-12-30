import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { ChatTabService } from '../chat-tab/chat-tab.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'chatlist-element',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './chat-list-element.component.html'
})
export class ChatListElement implements OnInit {
  @Input() chatName: string;
  @Input() latestMessage: {name:string, message:string};
  @Input() chatPic: string = "";
  @Input() chatId: string = "";
  @Input() members: string[] = [];
  @Input() isActive: Boolean = false;
  @Input() isGroupChat: boolean;
  
  constructor(private chatTabService: ChatTabService){}

  ngOnInit(): void {
  }

  changeActiveChat(){
    this.chatTabService.updateActiveChat({chatId: this.chatId, chatName: this.chatName, members: this.members, isGc: this.isGroupChat})
  }

  hideChat(){
    this.chatTabService.hideChat(this.chatId)
  }

  leaveGc(){
    this.chatTabService.leaveGroupChat(this.chatId);
  }
  

  // specifically to open the right click mat menu
  menuTopLeftPosition = { x: '0', y: '0' }
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;
  onRightClick(event:any) {
        // preventDefault avoids to show the visualization of the right-click menu of the browser 
        event.preventDefault();

        // we record the mouse position in our object 
        this.menuTopLeftPosition.x = event.clientX + 'px';
        this.menuTopLeftPosition.y = event.clientY + 'px';
        
        // we open the correct mat-menu 
        this.matMenuTrigger.openMenu();
  }
} 
