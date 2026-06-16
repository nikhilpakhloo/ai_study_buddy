import type { DocumentPickerAsset } from "expo-document-picker";
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import { APP_STRINGS } from "@/constants/strings";

type ChatComposerContextValue = {
  document: DocumentPickerAsset | null;
  message: string;
  setDocument: (document: DocumentPickerAsset | null) => void;
  setMessage: (message: string) => void;
  startNewChat: () => void;
};

const ChatComposerContext = createContext<ChatComposerContextValue | null>(null);

export function ChatComposerProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState("");
  const [document, setDocument] = useState<DocumentPickerAsset | null>(null);

  const value = useMemo(
    () => ({
      document,
      message,
      setDocument,
      setMessage,
      startNewChat: () => {
        setMessage("");
        setDocument(null);
      },
    }),
    [document, message],
  );

  return <ChatComposerContext.Provider value={value}>{children}</ChatComposerContext.Provider>;
}

export function useChatComposer() {
  const context = useContext(ChatComposerContext);

  if (!context) {
    throw new Error(APP_STRINGS.chat.missingProvider);
  }

  return context;
}
