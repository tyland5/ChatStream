import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ActiveChat } from '../../interfaces/interfaces';

@Component({
  selector: 'chatlist-element',
  standalone: true,
  imports: [],
  templateUrl: './chat-list-element.component.html'
})
export class ChatListElement implements OnInit {
  @Input() chatName: string;
  @Input() latestMessage: {name:string, message:string};
  @Input() chatPic: string = "";
  @Input() chatId: string = "";

  @Output() changeActiveChat = new EventEmitter<ActiveChat>();
  
  ngOnInit(): void {
  }

  emitChangeActiveChat(){
    this.changeActiveChat.emit({chatId: this.chatId, chatName: this.chatName});
  }
} 
