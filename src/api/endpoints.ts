export const API_ENDPOINTS = {
  auth: {
    socialLogin: "auth/social-login",
    me: "auth/me",
  },
  home: {
    createCoversation: "chat/conversation",
    getCoversation: "chat/conversations",
    sendMessages: "chat/message",
    getMessagesByCoversation:
      "chat/conversation/6a303f3b8ad0cf991fb3fe5e/messages",
  },
} as const;
