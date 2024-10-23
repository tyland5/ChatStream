export interface LoginJsonResponse{
    csrf:string,
    uid: string
}

export interface ChatListResponse{
    id: string,
    members: string[],
    latestMessage: {
        uid: string,
        message: string
    },
    chatName ?: string,
    chatPic ?: string
}

export interface User{
    id: string,
    username: string,
    name: string,
    pfp: string,
    password: string
}

export interface FinalChatListResponse{
    chatlist: ChatListResponse[],
    users: User[]
}

export interface MessageResponse{
    id: string,
    sender: string,
    message: string,
    sentAt: number,
    chatId: string
}

export interface ActiveChat{
    chatId: string,
    chatName: string,
}