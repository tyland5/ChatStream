import {afterNextRender, Component, inject, Injector, ViewChild, ElementRef, Input, Output, HostListener, AfterViewInit, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import { ChatMessage } from '../chat-message/chat-message.component';
import { FormsModule } from '@angular/forms';
import { ChatPageService } from './chat-page.service';
import { MessageResponse } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/interfaces';
import { Subscription } from 'rxjs';

// A document, including all its embedded documents and arrays, cannot exceed 16MB
@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, TextFieldModule, ChatMessage, FormsModule, CommonModule],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss'
})
export class ChatPage implements AfterViewInit, OnChanges, OnInit{
  private _injector = inject(Injector);
  message: string = "";
  chatHistory: MessageResponse[];
  chatSize: number;
  stompSubscription: Subscription;

  @Input() chatId: string;
  @Input() userInfoDict:  { [id: string]: User };
  @Input() chatName: string;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('textInput') textInput: ElementRef;
  @ViewChild('chatPageContainer') chatScreen: ElementRef;
  @ViewChild('chatHeader') chatHeader: ElementRef;
  @ViewChild('chatMessages') chatMessages: ElementRef;

  constructor(private chatpageService: ChatPageService){}

  ngOnInit(): void {
    
  }

  // used to display new messages when a user selects a different chat
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['chatId'].currentValue !== changes['chatId'].previousValue){
      this.chatpageService.getMessages(this.chatId).subscribe(response=>{
        this.chatHistory = response;
      })

      if (this.stompSubscription !== undefined){
        this.stompSubscription.unsubscribe();
      }

      this.stompSubscription = this.chatpageService.changeSubscription(changes['chatId'].currentValue).subscribe(message => {
        const messageObj: MessageResponse= JSON.parse(message.body)
        this.chatHistory.push(messageObj)
      })

      setTimeout(()=>{
        this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
      }, 150)
    }
  }

  ngAfterViewInit() {
    // i need this setTimeout or else i get an error saying i changed a view
    setTimeout(() => {
      this.chatSize = this.chatScreen.nativeElement.offsetHeight - (this.chatHeader.nativeElement.offsetHeight) - (this.textInput.nativeElement.offsetHeight) ;
    }, 100);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?:Event) {
    this.chatSize = this.chatScreen.nativeElement.offsetHeight - (this.chatHeader.nativeElement.offsetHeight) - (this.textInput.nativeElement.offsetHeight) ;
  }

  @Output() 
  changeChatMessage(message?:Event):void{
    // account for header, account for padding on y and border of input
    this.chatSize = this.chatScreen.nativeElement.offsetHeight - (this.chatHeader.nativeElement.offsetHeight) - (this.textInput.nativeElement.offsetHeight) ;
  }

  @Output()
  sendMessage():void{
    const uid = localStorage.getItem('uid') as string;
    this.chatpageService.sendMessage(this.message, this.chatId, uid, "test date")
    this.message = "";
  }

  createMessageInput(chat: MessageResponse){
    const userInfo = this.userInfoDict[chat.sender]
    return {messageObj: chat, senderInfo: userInfo}
  }
}
