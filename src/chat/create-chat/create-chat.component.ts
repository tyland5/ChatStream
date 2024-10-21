import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../interfaces/interfaces';
import { UserListElement } from '../../user/user-list/usesr-list-element.component';

@Component({
  selector: 'create-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, UserListElement],
  templateUrl: './create-chat.component.html'
})
export class CreateChat implements OnChanges{
  filteredFriendList: User[] = [];
  selectedUsers: string[] = [];
  @Input() friendList: User[] = [];
  @Output() closeCreateChat = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['friendList']){
      this.filteredFriendList = this.friendList
    }
  }

  endCreateChat(): void{
    this.closeCreateChat.emit();
  }
 
  filterFriendList(event:Event){
    const userSearch = (event.target as HTMLTextAreaElement)?.value.toLowerCase()
    this.filteredFriendList = this.friendList.filter(user => user.name.toLowerCase().startsWith(userSearch) || user.username.toLowerCase().startsWith(userSearch))
    return 
  }

  modifySelectedUsers(username:string){
    
    if(this.selectedUsers.includes(username)){
      this.selectedUsers = this.selectedUsers.filter(_username => _username != username)
    }
    else{
      this.selectedUsers.push(username)
    }
  }
}
