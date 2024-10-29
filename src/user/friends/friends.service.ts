import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { User } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {

    constructor(private http:HttpClient){}

    
    getFriends(uid: string){
      const friendList = new Subject<User[]>();

      this.http.get<User[]>('http://localhost:8080/get-friends', {responseType:"json", withCredentials: true, params:{uid:uid}}).subscribe(friends =>{
        friendList.next(friends)
      })

      return friendList.asObservable();
    }

    
}