import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { User } from "../../interfaces/interfaces";
import { UserListElement } from "../user-list/user-list-element.component";
import { FriendsService } from "./friends.service";
import { FormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'friends-page',
    standalone: true,
    imports: [MatIconModule, MatExpansionModule, CommonModule, UserListElement, FormsModule],
    templateUrl: './friends.component.html',
  })
  export class Friends implements OnInit{
    panelOpenState: boolean = false; // this is for the view selector (i.e. friends, requests)
    selectedView: string = "Friends";
    username: string = "";

    friendList: User[] = [];
    incomingRequests: User[] = [];
    outgoingRequests: User[] = [];

    userNonexistentErr: boolean = false;
    alreadyFriendsErr: boolean = false;
    alreadyPendingErr: boolean = false;

    constructor(private friendsService: FriendsService, private snackBar: MatSnackBar){}

    ngOnInit(): void {
        // fetch all lists from api
        this.friendsService.getFriends().subscribe(friendList => {
            this.friendList = friendList
        })
        
        this.friendsService.getIncomingFriendRequests().subscribe(incoming => {
            this.incomingRequests = incoming
        })

        this.friendsService.getOutgoingFriendRequests().subscribe(outgoing => {
            this.outgoingRequests = outgoing
        })
    }

    searchUser(): void{
        this.alreadyFriendsErr = false
        this.alreadyPendingErr = false
        this.userNonexistentErr = false;
        
        const checkFriendList = this.friendList.filter(obj => obj.username === this.username)
        if(checkFriendList.length > 0){
            this.alreadyFriendsErr = true
            return 
        }

        const checkIncomingList = this.incomingRequests.filter(obj => obj.username === this.username)
        const checkOutgoingList = this.outgoingRequests.filter(obj => obj.username === this.username)
        if(checkOutgoingList.length > 0 || checkIncomingList.length > 0){
            this.alreadyPendingErr = true
            return 
        }

        this.friendsService.getUserByUsername(this.username).subscribe(user=>{
            if(JSON.stringify(user) === "{}"){
                this.userNonexistentErr = true;
                return
            }
           
            // valid user
            this.friendsService.sendFriendRequest(user.id).subscribe(sent=>{
                if(sent){
                    this.outgoingRequests.push(user)
                    this.snackBar.open("Friend request sent", "Dismiss", {
                        duration: 3000
                    })
                }
            })
        })
    }

    // this is if a user declines an incoming request or cancels an outgoing request
    handleCancelClicked(uid: string, incomingRequest: boolean){
        if(incomingRequest){
            this.friendsService.removeIncomingFriendRequest(uid).subscribe(removed=>{
                if(removed){
                    this.incomingRequests = this.incomingRequests.filter(requestingUser => requestingUser.id !== uid) 
                }
            })
            return
        }
        //else
        this.friendsService.removeOutgoingFriendRequest(uid).subscribe(removed=>{
            if(removed){
                this.outgoingRequests = this.outgoingRequests.filter(requestingUser => requestingUser.id !== uid) 
            }
        })
    }

    // this is if a user accepts an incoming request
    handleConfirmClicked(user:User){
        this.friendsService.acceptFriendRequest(user.id).subscribe(accepted=>{
            if(!accepted){
                return
            }
            this.incomingRequests = this.incomingRequests.filter(requestingUser => requestingUser.id !== user.id) // remove from incomingRequests
            this.friendList.push({...user}) // add to friend list
        })
    }
  }