export const API_ENDPOINTS = {
  auth: {
    socialLogin: "auth/social-login",
    me: "auth/me",
  },
  home: {
    createConversation: "chat/conversation",
    getConversations: "chat/conversations",
    sendMessages: "chat/message",
    getMessagesByConversation: (conversationId: string) =>
      `chat/conversation/${conversationId}/messages`,
    upload: "documents/upload",
  },
} as const;
