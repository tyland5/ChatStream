import {Component, inject, Injector, ViewChild, ElementRef, Input, Output, OnInit, OnDestroy, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { ChatInfoModal } from '../chat-info-modal/chat-info-modal.component';
import { ChatListService } from '../chat-list/chat-list.service';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

// A document, including all its embedded documents and arrays, cannot exceed 16MB
@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, TextFieldModule, ChatMessage, FormsModule, CommonModule, MatIconModule],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
})
export class ChatPage implements OnDestroy, OnInit, OnChanges{
  private _injector = inject(Injector);
  onMobile: boolean = window.innerWidth < 768
  message: string = "";
  chatHistory: MessageResponse[];
  stompSubscription: Subscription;
  activeChatSubscription: Subscription; // need only for private chat
  editingMessageId: string = "";
  uploadedMedia: File | undefined;
  previewImage: string | ArrayBuffer | null = null;
  readonly dialog = inject(MatDialog); // for chat info modal
  personalUserInfo: User;
  personalUserInfoSubscription: Subscription;

  @Input() chatId: string;
  @Input() chatName: string;
  @Input() members: string[];
  @Input() isGc: boolean;

  // might need input that specifies if private chat or public
  @Input() userInfoDict:  { [id: string]: User }; // should be initialized in ngoninit for public
  @Output() backPressed = new EventEmitter<void>();
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('chatMessages') chatMessages: ElementRef;

  constructor(private chatpageService: ChatPageService, private chatListService: ChatListService, private personalUserInfoService: PersonalUserInfoService){}

  ngOnInit(): void {
    this.personalUserInfoSubscription = this.personalUserInfoService.userInfo.subscribe(info => this.personalUserInfo = info)
  }

  ngOnChanges(changes: SimpleChanges): void {
    // chat has been changed so switch
    if(changes['chatId'] !== undefined && changes['chatId'].currentValue !== changes['chatId'].previousValue){
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
        else if(messageObj.type === "edit"){
          const index = this.chatHistory.findIndex(message => message.id === messageObj.id)
          this.chatHistory[index].message = messageObj.message
        }
      })

      this.scrollToBottom()
    }
  }


  ngOnDestroy(): void {
    if (this.stompSubscription !== undefined){
      this.stompSubscription.unsubscribe(); // necessary
    }

    this.personalUserInfoSubscription.unsubscribe();
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

    const uid = this.personalUserInfo.id
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

  openChatInfoModal(): void {
    const memberList: User[] = []
    this.members.forEach(uid => memberList.push(this.userInfoDict[uid]))

    const dialogRef = this.dialog.open(ChatInfoModal, {
      width:"500px", // need this because making screen width smaller clips out buttons and input without it
      data: {
        members: memberList,
        chatName: this.chatName,
        chatId: this.chatId
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // result is just a string (chatname) right now
      if (result !== undefined) {
        this.chatName = result
        this.chatListService.updateChatInfo(result, this.chatId)
      }
    });

  }

}
