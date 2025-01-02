export interface LoginJsonResponse{
    csrf:string,
    uid: string,
    pfp: string,
    username: string,
    name: string
}

export interface ChatListResponse{
    id: string,
    members: string[],
    latestMessage: {
        uid: string,
        message: string,
        messageId: string,
    },
    chatName ?: string,
    chatPic ?: string
    hidden?: string[]
}

export interface User{
    id: string,
    username: string,
    name: string,
    pfp: string,
    password?: string
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
    chatId: string,
    media: string, // url
    type: string
}

export interface ActiveChat{
    chatId: string,
    chatName: string,
    members: string[],
    isGc: boolean
}