import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'create-account',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './create-account.component.html',
})
export class CreateAccount {
  title = 'ChatStream';
}
