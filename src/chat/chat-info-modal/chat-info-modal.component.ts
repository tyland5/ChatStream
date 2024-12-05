import { Component, inject} from "@angular/core";
import { MatDialogActions, MatDialogContent, MatDialogTitle, MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { UserListElement } from "../../user/user-list/user-list-element.component";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'chat-info-modal',
    standalone: true,
    imports: [CommonModule, UserListElement, FormsModule, MatDialogClose],
    templateUrl: './chat-info-modal.component.html'
  })
  export class ChatInfoModal{
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef<ChatInfoModal>);
    chatName = this.data.chatName
  }