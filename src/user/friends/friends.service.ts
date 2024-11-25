import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { User } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {

    constructor(private http:HttpClient){}

    
    getFriends(){
      const friendList = new Subject<User[]>();

      this.http.get<User[]>('http://localhost:8080/get-friends', {responseType:"json", withCredentials: true}).subscribe(friends =>{
        friendList.next(friends)
      })

      return friendList.asObservable();
    }

    getIncomingFriendRequests(){
      const incomingRequests = new Subject<User[]>();

      this.http.get<User[]>('http://localhost:8080/get-incoming-friend-requests', {responseType:"json", withCredentials: true}).subscribe(incoming =>{
        incomingRequests.next(incoming)
      })

      return incomingRequests.asObservable();
    }

    getOutgoingFriendRequests(){
      const outgoingRequests = new Subject<User[]>();

      this.http.get<User[]>('http://localhost:8080/get-outgoing-friend-requests', {responseType:"json", withCredentials: true}).subscribe(outgoing =>{
        outgoingRequests.next(outgoing)
      })

      return outgoingRequests.asObservable();
    }

    getUserByUsername(username: string){
      const user = new Subject<User>();

      this.http.get<User[]>('http://localhost:8080/get-user-info-username', {responseType:"json", withCredentials: true, params:{username:username}}).subscribe(users =>{
        if(users.length === 0){
          user.next({} as User)
        }
        else{
          user.next(users[0])
        }
      })

      return user.asObservable()
    }

    sendFriendRequest(otherUid: string){
      const sent = new Subject<boolean>();

      this.http.post<{"inserted":boolean}>("http://localhost:8080/send-friend-request", {uid:otherUid}, {responseType:"json", withCredentials: true})
      .subscribe(response => {
        sent.next(response.inserted)
      })

      return sent.asObservable()
    }

    acceptFriendRequest(otherUid:string){
      const accepted = new Subject<boolean>();
      
      this.http.put<{"accepted":boolean}>("http://localhost:8080/accept-friend-request", {uid:otherUid}, {responseType:"json", withCredentials: true})
      .subscribe(response => {
        accepted.next(response.accepted)
      })

      return accepted.asObservable()

    }

    removeOutgoingFriendRequest(otherUid: string){
      const removed = new Subject<boolean>();

      this.http.post<{"removed":boolean}>("http://localhost:8080/remove-outgoing-friend-request", {uid:otherUid}, {responseType:"json", withCredentials: true})
      .subscribe(response => {
        removed.next(response.removed)
      })

      return removed.asObservable()
    }

    removeIncomingFriendRequest(otherUid: string){
      const removed = new Subject<boolean>();

      this.http.post<{"removed":boolean}>("http://localhost:8080/remove-incoming-friend-request", {uid:otherUid}, {responseType:"json", withCredentials: true})
      .subscribe(response => {
        removed.next(response.removed)
      })

      return removed.asObservable()
    }
}