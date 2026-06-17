import type { DocumentPickerAsset } from "expo-document-picker";
import { create } from "zustand";

export type ChatBubble = {
  createdAt?: string;
  id: string;
  document: DocumentPickerAsset | null;
  text: string;
};

type ChatStore = {
  chatBubbles: ChatBubble[];
  conversationId: string | null;
  document: DocumentPickerAsset | null;
  message: string;
  addChatBubble: (chatBubble: ChatBubble) => void;
  resetChatDraft: () => void;
  setChatBubbles: (
    chatBubbles: ChatBubble[] | ((chatBubbles: ChatBubble[]) => ChatBubble[]),
  ) => void;
  setConversationId: (conversationId: string | null) => void;
  setDocument: (document: DocumentPickerAsset | null) => void;
  setMessage: (message: string) => void;
  startNewChat: () => void;
};

const initialChatState = {
  chatBubbles: [],
  conversationId: null,
  document: null,
  message: "",
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialChatState,
  addChatBubble: (chatBubble) =>
    set((state) => ({ chatBubbles: [...state.chatBubbles, chatBubble] })),
  resetChatDraft: () =>
    set({
      chatBubbles: [],
      document: null,
      message: "",
    }),
  setChatBubbles: (chatBubbles) =>
    set((state) => ({
      chatBubbles:
        typeof chatBubbles === "function"
          ? chatBubbles(state.chatBubbles)
          : chatBubbles,
    })),
  setConversationId: (conversationId) => set({ conversationId }),
  setDocument: (document) => set({ document }),
  setMessage: (message) => set({ message }),
  startNewChat: () => set(initialChatState),
}));
