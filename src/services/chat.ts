import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { getAuth, getIdToken } from "@react-native-firebase/auth";

import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { APP_STRINGS } from "@/constants/strings";

type ApiConversation = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
};

type CreateConversationResponse = {
  conversation?: ApiConversation;
  data?: ApiConversation;
  _id?: string;
  id?: string;
};

type GetConversationsResponse =
  | ApiConversation[]
  | {
      conversations?: ApiConversation[];
      data?: ApiConversation[];
    };

type ApiMessage = {
  _id?: string;
  id?: string;
  content?: string;
  document?: {
    name?: string;
    originalName?: string;
    fileName?: string;
  };
  file?: {
    name?: string;
    originalName?: string;
    fileName?: string;
  };
  message?: string;
  role?: string;
  sender?: string;
  text?: string;
  title?: string;
};

type GetConversationMessagesResponse =
  | ApiMessage[]
  | {
      data?: ApiMessage[];
      messages?: ApiMessage[];
    };

type UploadErrorResponse = {
  error?: string;
  message?: string;
};

export type Conversation = {
  id: string;
  title: string;
};

export type ConversationMessage = {
  documentName: string | null;
  id: string;
  role: "assistant" | "user";
  text: string;
};

export type SendMessagePayload = {
  conversationId: string;
  message: string;
};

export type UploadDocumentPayload = {
  document: {
    mimeType?: string | null;
    name: string;
    uri: string;
  };
};

export async function createConversation(title: string) {
  const response = await apiClient.post<CreateConversationResponse>(
    API_ENDPOINTS.home.createConversation,
    { title },
  );

  const conversation =
    response.data.conversation ?? response.data.data ?? response.data;
  const conversationId = conversation._id ?? conversation.id;

  if (!conversationId) {
    throw new Error("Conversation id was not returned by the API");
  }

  return conversationId;
}

export async function getConversations() {
  const response = await apiClient.get<GetConversationsResponse>(
    API_ENDPOINTS.home.getConversations,
  );
  const conversations = Array.isArray(response.data)
    ? response.data
    : response.data.conversations ?? response.data.data ?? [];

  return conversations.reduce<Conversation[]>((currentConversations, conversation) => {
    const id = conversation._id ?? conversation.id;

    if (!id) {
      return currentConversations;
    }

    currentConversations.push({
      id,
      title: conversation.title ?? conversation.name ?? "Untitled chat",
    });

    return currentConversations;
  }, []);
}

export async function sendChatMessage({ conversationId, message }: SendMessagePayload) {
  const response = await apiClient.post(API_ENDPOINTS.home.sendMessages, {
    conversationId,
    message,
  });

  return response.data;
}

export async function uploadDocument({ document }: UploadDocumentPayload) {
  const baseURL = apiClient.defaults.baseURL;
  const user = getAuth().currentUser;

  if (!baseURL) {
    throw new Error(APP_STRINGS.api.missingBaseUrl);
  }

  if (!user) {
    throw new Error(APP_STRINGS.auth.authenticationRequired);
  }

  const idToken = await getIdToken(user);
  const uploadUrl = `${baseURL.replace(/\/$/, "")}/${API_ENDPOINTS.home.upload}`;

  console.log("[uploadDocument] start", {
    endpoint: uploadUrl,
    mimeType: document.mimeType,
    name: document.name,
    uri: document.uri,
  });

  const file = new File(document.uri);
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await fetch(uploadUrl, {
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      method: "POST",
    });
    const responseText = await response.text();
    let responseData: UploadErrorResponse | string | null = null;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      console.log("[uploadDocument] http error", {
        body: responseData,
        status: response.status,
      });

      const errorMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ?? responseData?.error;

      throw new Error(
        errorMessage ?? `Upload failed with status ${response.status}`,
      );
    }

    console.log("[uploadDocument] success", responseData);

    return responseData;
  } catch (error) {
    console.log("[uploadDocument] failed", error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: string) {
  const response = await apiClient.get<GetConversationMessagesResponse>(
    API_ENDPOINTS.home.getMessagesByConversation(conversationId),
  );
  const messages = Array.isArray(response.data)
    ? response.data
    : response.data.messages ?? response.data.data ?? [];

  return messages.map<ConversationMessage>((message, index) => {
    const role = message.role ?? message.sender;
    const document = message.document ?? message.file;

    return {
      documentName:
        document?.name ?? document?.originalName ?? document?.fileName ?? null,
      id: message._id ?? message.id ?? `${conversationId}-${index}`,
      role: role === "assistant" ? "assistant" : "user",
      text: message.message ?? message.text ?? message.content ?? message.title ?? "",
    };
  });
}
