import { Component, Input} from '@angular/core';
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
export class ChatMessage {
  @Input() messageInfo: {messageObj: MessageResponse, senderInfo: User};


}
