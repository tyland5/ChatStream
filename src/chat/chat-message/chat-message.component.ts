import { Component, Input, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MessageResponse, User} from '../../interfaces/interfaces';

@Component({
  selector: 'chat-message',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './chat-message.component.html',
  styleUrl:'./chat-message.component.scss'
})
export class ChatMessage implements OnInit{
  @Input() messageInfo: {messageObj: MessageResponse, senderInfo: User};

  ngOnInit(): void {
  }

  getDate(): string{
    const date = new Date(this.messageInfo.messageObj.sentAt).toLocaleDateString()
    return date
  }

  getTime(): string{
    const time = new Date(this.messageInfo.messageObj.sentAt).toLocaleTimeString(undefined, {timeStyle:"short"})
    return time
  }
}
