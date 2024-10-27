import { Component, Input, Output, EventEmitter} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MessageResponse, User} from '../../interfaces/interfaces';
import { ChatPageService } from '../chat-page/chat-page.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chat-message',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl:'./chat-message.component.scss'
})
export class ChatMessage{
  @Input() messageInfo: {messageObj: MessageResponse, senderInfo: User};
  @Input() highlightedMessage: boolean;
  uid: string = localStorage.getItem('uid') as string
  @Output() editingMessageId = new EventEmitter<string>();

  constructor(private chatPageService: ChatPageService){}

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
    this.chatPageService.updateMessage(message.id, message.message, message.chatId, "delete")
  }

  emitEditingMessageId(){
    this.editingMessageId.emit(this.messageInfo.messageObj.id)
  }

}
