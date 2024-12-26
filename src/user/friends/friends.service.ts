import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { User } from '../../interfaces/interfaces';
import { environment } from '../../environments/environment';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsService implements OnDestroy{
    csrf: string;
    personalUserInfoSubscription:Subscription

    constructor(private http:HttpClient, private personalUserInfoService: PersonalUserInfoService){
      this.personalUserInfoSubscription = this.personalUserInfoService.csrf.subscribe(csrf => this.csrf = csrf)
    }

    ngOnDestroy(): void {
      this.personalUserInfoSubscription.unsubscribe()
    }

    
    getFriends(){
      const friendList = new Subject<User[]>();

      this.http.get<{friends: User[]}>(environment.apiBaseUrl + '/get-friends', {responseType:"json", withCredentials: true}).subscribe(response =>{
        friendList.next(response.friends)
      })

      return friendList.asObservable();
    }

    getIncomingFriendRequests(){
      const incomingRequests = new Subject<User[]>();

      this.http.get<{incoming: User[]}>(environment.apiBaseUrl + '/get-incoming-friend-requests', {responseType:"json", withCredentials: true}).subscribe(response =>{
        incomingRequests.next(response.incoming)
      })

      return incomingRequests.asObservable();
    }

    getOutgoingFriendRequests(){
      const outgoingRequests = new Subject<User[]>();

      this.http.get<{outgoing: User[]}>(environment.apiBaseUrl + '/get-outgoing-friend-requests', {responseType:"json", withCredentials: true}).subscribe(response =>{
        outgoingRequests.next(response.outgoing)
      })

      return outgoingRequests.asObservable();
    }

    getUserByUsername(username: string){
      const user = new Subject<User>();

      this.http.get<{uinfo: User[]}>(environment.apiBaseUrl + '/get-user-info-username', {responseType:"json", withCredentials: true, params:{username:username}}).subscribe(users =>{
        if(users.uinfo.length === 0){
          user.next({} as User)
        }
        else{
          user.next(users.uinfo[0])
        }
      })

      return user.asObservable()
    }

    sendFriendRequest(otherUid: string){
      const sent = new Subject<boolean>();

      this.http.post<{inserted:boolean}>(environment.apiBaseUrl + "/send-friend-request", {uid:otherUid}, 
        {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
      .subscribe(response => {
        sent.next(response.inserted)
      })

      return sent.asObservable()
    }

    acceptFriendRequest(otherUid:string){
      const accepted = new Subject<boolean>();
      
      this.http.put<{accepted:boolean}>(environment.apiBaseUrl + "/accept-friend-request", {uid:otherUid}, 
        {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
      .subscribe(response => {
        accepted.next(response.accepted)
      })

      return accepted.asObservable()

    }

    removeOutgoingFriendRequest(otherUid: string){
      const removed = new Subject<boolean>();

      this.http.post<{removed:boolean}>(environment.apiBaseUrl + "/remove-outgoing-friend-request", {uid:otherUid}, 
        {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
      .subscribe(response => {
        removed.next(response.removed)
      })

      return removed.asObservable()
    }

    removeIncomingFriendRequest(otherUid: string){
      const removed = new Subject<boolean>();

      this.http.post<{removed:boolean}>(environment.apiBaseUrl + "/remove-incoming-friend-request", {uid:otherUid}, 
        {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
      .subscribe(response => {
        removed.next(response.removed)
      })

      return removed.asObservable()
    }
}