import {afterNextRender, Component, inject, Injector, ViewChild, ElementRef, Input, Output, HostListener, AfterViewInit, OnInit, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
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
import { ChatTabService } from '../chat-tab/chat-tab.service';
import {MatIconModule} from '@angular/material/icon';

// A document, including all its embedded documents and arrays, cannot exceed 16MB
@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, TextFieldModule, ChatMessage, FormsModule, CommonModule, MatIconModule],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
})
export class ChatPage implements OnDestroy, OnInit{
  private _injector = inject(Injector);
  message: string = "";
  chatHistory: MessageResponse[];
  stompSubscription: Subscription;
  activeChatSubscription: Subscription;
  editingMessageId: string = "";
  uploadedMedia: File | undefined;
  previewImage: string | ArrayBuffer | null = null;

  chatId: string;
  chatName: string;

  @Input() userInfoDict:  { [id: string]: User };
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('chatMessages') chatMessages: ElementRef;

  constructor(private chatpageService: ChatPageService, private chatTabService: ChatTabService){}

  ngOnInit(): void {

    // get messages for new chat
    this.activeChatSubscription = this.chatTabService.activeChat.subscribe(newActiveChat => {
      this.chatId = newActiveChat.chatId
      this.chatName = newActiveChat.chatName
      this.message = "";
      this.editingMessageId = "",
      this.uploadedMedia = undefined;
      this.previewImage = null;

      this.chatpageService.getMessages(this.chatId).subscribe(response=>{
        this.chatHistory = response;
      })

      if (this.stompSubscription !== undefined){
        this.stompSubscription.unsubscribe();
      }

      // create new subscription  for messages and update accordingly when get new  message from server
      this.stompSubscription = this.chatpageService.changeSubscription(this.chatId).subscribe(message => {
        const messageObj: MessageResponse= JSON.parse(message.body)
        if(messageObj.type === "create"){
          this.chatHistory.push(messageObj)

          // if the user is at bottom of chat page, scroll down when user receives a message so it can be shown properly
          if(this.chatMessages.nativeElement.scrollTop === this.chatMessages.nativeElement.scrollHeight - this.chatMessages.nativeElement.clientHeight){
            this.scrollToBottom()
          }
        }
        else if(messageObj.type === "delete"){
          this.chatHistory = this.chatHistory.filter(message => message.id !== messageObj.id)
        }
        else{
          const index = this.chatHistory.findIndex(message => message.id === messageObj.id)
          this.chatHistory[index].message = messageObj.message
        }
      })

      this.scrollToBottom()
    })
  }


  ngOnDestroy(): void {
    if (this.stompSubscription !== undefined){
      this.stompSubscription.unsubscribe(); // necessary
    }

    this.activeChatSubscription.unsubscribe();
  }


  @Output()
  sendMessage():void{

    // cant send in chat where nothing is selected or if there is no content
    if(this.chatId ==="" || (this.message === "" && this.uploadedMedia === undefined)){
      return
    }

    if(this.editingMessageId !== ""){
      this.chatpageService.updateMessage(this.editingMessageId, this.message, this.chatId, "edit")
      this.message = ""
      this.editingMessageId = ""
      return
    }

    const uid = localStorage.getItem('uid') as string;
    this.chatpageService.sendMessage(this.message, this.chatId, uid, this.uploadedMedia)
    this.message = "";
    this.uploadedMedia = undefined;
    this.previewImage = null;
  }

  scrollToBottom(){
    setTimeout(()=>{
      this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    }, 150)
  }

  createMessageInput(chat: MessageResponse){
    const userInfo = this.userInfoDict[chat.sender]
    return {messageObj: chat, senderInfo: userInfo}
  }

  changeEditingMessageId(id: string){
    this.editingMessageId = id
    this.message = this.chatHistory.filter(message => message.id === id)[0].message
  }

  getInputLabel(){
    let inputLabel: string = "Send to " + this.chatName 

    // editing
    if(this.editingMessageId != ""){
      inputLabel = "Edit highlighted message"
    }

    return inputLabel
  }

  onFileSelected(event: any){
    this.uploadedMedia = event.target.files[0]

    // create preview image
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}
