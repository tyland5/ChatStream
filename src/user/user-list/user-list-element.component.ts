import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActiveChat, User } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'userlist-element',
  standalone: true,
  imports: [CommonModule, MatCheckbox, MatIconModule],
  templateUrl: './user-list-element.component.html'
})
export class UserListElement {
  @Input() id: string;
  @Input() username: string;
  @Input() name: string;
  @Input() pfp: string;
  @Input() selected: boolean;

  // want a similar appearance, but depending on screen, buttons next to names will be different and clicks
  @Input() inCreateChat: boolean = false;
  @Input() inIncomingRequest: boolean = false;
  @Input() inOutgoingRequest: boolean = false;

  @Output() changeSelection = new EventEmitter<string>();
  @Output() cancelClicked = new EventEmitter<string>();
  @Output() confirmClicked = new EventEmitter<User>();

  userSelected(): void{
    // in case i want it to open up profile in future if on a different screen from createChat
    if(this.inCreateChat){
      this.changeSelection.emit(this.id);
    }
  }

  handleCancelClicked(): void{
    this.cancelClicked.emit(this.id)
  }

  handleConfirmClicked(): void{
    this.confirmClicked.emit({id: this.id, username: this.username, name:this.name, pfp:this.pfp})
  }
} 
