import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createConversation,
  getConversationMessages,
  getConversations,
  sendChatMessage,
  uploadDocument,
  type Conversation,
  type ConversationMessage,
} from "@/services/chat";

export const chatQueryKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatQueryKeys.all, "conversations"] as const,
  messages: (conversationId: string) =>
    [...chatQueryKeys.all, "conversations", conversationId, "messages"] as const,
};

export function useConversationsQuery() {
  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: getConversations,
    staleTime: 30_000,
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: (conversationId, title) => {
      queryClient.setQueryData<Conversation[]>(
        chatQueryKeys.conversations(),
        (currentConversations = []) => [
          { id: conversationId, title },
          ...currentConversations.filter(
            (conversation) => conversation.id !== conversationId,
          ),
        ],
      );

      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

export function useSendChatMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (assistantMessages, variables) => {
      queryClient.setQueryData<ConversationMessage[]>(
        chatQueryKeys.messages(variables.conversationId),
        (currentMessages = []) => [
          ...currentMessages,
          {
            documentName: null,
            id: `user-${Date.now()}`,
            role: "user",
            text: variables.message,
          },
          ...assistantMessages,
        ],
      );
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

export function useUploadDocumentMutation() {
  return useMutation({
    mutationFn: uploadDocument,
  });
}

export function useConversationMessagesQuery(conversationId: string | null) {
  return useQuery({
    enabled: Boolean(conversationId),
    queryKey: conversationId
      ? chatQueryKeys.messages(conversationId)
      : [...chatQueryKeys.all, "conversations", "messages"],
    queryFn: () => getConversationMessages(conversationId ?? ""),
  });
}
