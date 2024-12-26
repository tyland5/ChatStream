import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MessageResponse, User} from '../../interfaces/interfaces';
import { ChatPageService } from '../chat-page/chat-page.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Component({
  selector: 'chat-message',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl:'./chat-message.component.scss'
})
export class ChatMessage implements OnInit, OnDestroy{
  onMobile: boolean = window.innerWidth < 768
  uid: string;
  personalUserInfoSubscription: Subscription;

  @Input() messageInfo: {messageObj: MessageResponse, senderInfo: User};
  @Input() highlightedMessage: boolean;
  @Input() mediaUrl: string;
  @Output() editingMessageId = new EventEmitter<string>();

  constructor(private chatPageService: ChatPageService, private personalUserInfoService: PersonalUserInfoService){}

  ngOnInit(): void {
    this.personalUserInfoSubscription = this.personalUserInfoService.userInfo.subscribe(info => this.uid = info.id)
  }

  ngOnDestroy(): void {
    this.personalUserInfoSubscription.unsubscribe()
  }

  getDate(): string{
    const date = new Date(this.messageInfo.messageObj.sentAt).toLocaleDateString()
    return date
  }

  getTime(): string{
    const time = new Date(this.messageInfo.messageObj.sentAt).toLocaleTimeString(undefined, {timeStyle:"short"})
    return time
  }

  deleteMessage(){
    const message = this.messageInfo.messageObj
    this.chatPageService.updateMessage(message.id, message.message, message.chatId, "delete", message.media)
  }

  emitEditingMessageId(){
    this.editingMessageId.emit(this.messageInfo.messageObj.id)
  }

  // specifically to open the right click mat menu
  menuTopLeftPosition = { x: '0', y: '0' }
  @ViewChildren(MatMenuTrigger) matMenuTrigger: QueryList<MatMenuTrigger>;
  onRightClick(event:any) {
        // preventDefault avoids to show the visualization of the right-click menu of the browser 
        event.preventDefault();

        // we record the mouse position in our object 
        this.menuTopLeftPosition.x = event.clientX + 'px';
        this.menuTopLeftPosition.y = event.clientY + 'px';
        
        // we open the correct mat-menu 
        this.matMenuTrigger.toArray()[1].openMenu();
  }

}
