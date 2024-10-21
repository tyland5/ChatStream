import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chatlist-element',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list-element.component.html'
})
export class ChatListElement implements OnInit {
  @Input() chatName: string;
  @Input() latestMessage: {name:string, message:string};
  @Input() chatPic: string = "";
  @Input() chatId: string = "";
  @Input() isActive: Boolean = false;

  @Output() changeActiveChat = new EventEmitter<ActiveChat>();
  
  ngOnInit(): void {
  }

  emitChangeActiveChat(){
    this.changeActiveChat.emit({chatId: this.chatId, chatName: this.chatName});
  }
} 
