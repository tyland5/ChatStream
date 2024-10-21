import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'userlist-element',
  standalone: true,
  imports: [CommonModule, MatCheckbox],
  templateUrl: './user-list-element.component.html'
})
export class UserListElement {
  @Input() username: string;
  @Input() name: string;
  @Input() pfp: string;
  @Input() selected: boolean;

  @Output() changeSelection = new EventEmitter<string>();


  userSelected(): void{
    this.changeSelection.emit(this.username);
  }
} 
