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
  createdAt?: string;
  id?: string;
  answer?: unknown;
  assistantReply?: unknown;
  content?: unknown;
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
  message?: unknown;
  reply?: unknown;
  response?: unknown;
  role?: string;
  sender?: string;
  text?: unknown;
  title?: unknown;
  timestamp?: string;
  updatedAt?: string;
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

type SendMessageResponse =
  | string
  | ApiMessage[]
  | {
      answer?: unknown;
      assistantMessage?: ApiMessage;
      assistantReply?: unknown;
      data?: ApiMessage | ApiMessage[] | string;
      message?: ApiMessage | string;
      messages?: ApiMessage[];
      reply?: unknown;
      response?: unknown;
    };

export type Conversation = {
  id: string;
  title: string;
};

export type ConversationMessage = {
  createdAt?: string;
  documentName: string | null;
  id: string;
  isError?: boolean;
  role: "assistant" | "user";
  sources?: unknown[];
  text: string;
};

export type SendMessagePayload = {
  conversationId: string;
  message: string;
};

type StreamChatMessagePayload = SendMessagePayload & {
  onDone?: (data: StreamDoneEvent) => void;
  onError?: (data: StreamErrorEvent) => void;
  onStart?: (data: StreamStartEvent) => void;
  onToken?: (token: string) => void;
};

type StreamStartEvent = {
  success?: boolean;
  userMessage?: unknown;
};

type StreamDoneEvent = {
  reply?: string;
  sources?: unknown[];
  success?: boolean;
};

type StreamErrorEvent = {
  message?: string;
  success?: boolean;
};

export type UploadDocumentPayload = {
  document: {
    mimeType?: string | null;
    name: string;
    uri: string;
  };
};

function extractMessageText(value: unknown, depth = 0): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!value || depth > 2) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractMessageText(item, depth + 1);

      if (text) {
        return text;
      }
    }

    return null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return (
      extractMessageText(record.text, depth + 1) ??
      extractMessageText(record.content, depth + 1) ??
      extractMessageText(record.message, depth + 1) ??
      extractMessageText(record.reply, depth + 1) ??
      extractMessageText(record.answer, depth + 1) ??
      extractMessageText(record.assistantReply, depth + 1) ??
      extractMessageText(record.response, depth + 1) ??
      extractMessageText(record.title, depth + 1)
    );
  }

  return null;
}

function getObjectIdCreatedAt(id?: string) {
  if (!id || !/^[a-f\d]{24}$/i.test(id)) {
    return undefined;
  }

  return new Date(parseInt(id.slice(0, 8), 16) * 1000).toISOString();
}

function normalizeApiMessage(
  message: ApiMessage,
  fallbackId: string,
  fallbackRole: ConversationMessage["role"] = "user",
): ConversationMessage {
  const role = message.role ?? message.sender;
  const document = message.document ?? message.file;
  const id = message._id ?? message.id ?? fallbackId;
  const createdAt =
    message.createdAt ??
    message.timestamp ??
    message.updatedAt ??
    getObjectIdCreatedAt(id);

  return {
    createdAt,
    documentName:
      document?.name ?? document?.originalName ?? document?.fileName ?? null,
    id,
    role: role === "assistant" || role === "user" ? role : fallbackRole,
    text: extractMessageText(message) ?? "",
  };
}

function getResponseMessages(response: SendMessageResponse) {
  if (typeof response === "string") {
    return [
      {
        createdAt: new Date().toISOString(),
        documentName: null,
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        text: response,
      },
    ];
  }

  if (Array.isArray(response)) {
    return response
      .map((message, index) =>
        normalizeApiMessage(message, `message-${Date.now()}-${index}`),
      )
      .filter((message) => message.role === "assistant")
      .slice(-1);
  }

  const messageList = Array.isArray(response.messages)
    ? response.messages
    : Array.isArray(response.data)
      ? response.data
      : null;

  if (messageList) {
    return messageList
      .map((message, index) =>
        normalizeApiMessage(message, `message-${Date.now()}-${index}`),
      )
      .filter((message) => message.role === "assistant")
      .slice(-1);
  }

  const singleMessage =
    response.assistantMessage ??
    (response.reply && typeof response.reply === "object" && !Array.isArray(response.reply)
      ? response.reply
      : null) ??
    (response.answer && typeof response.answer === "object" && !Array.isArray(response.answer)
      ? response.answer
      : null) ??
    (response.assistantReply &&
    typeof response.assistantReply === "object" &&
    !Array.isArray(response.assistantReply)
      ? response.assistantReply
      : null) ??
    (response.response &&
    typeof response.response === "object" &&
    !Array.isArray(response.response)
      ? response.response
      : null) ??
    (response.data && typeof response.data === "object" && !Array.isArray(response.data)
      ? response.data
      : null) ??
    (response.message && typeof response.message === "object"
      ? response.message
      : null);

  if (singleMessage) {
    return [
      normalizeApiMessage(singleMessage, `assistant-${Date.now()}`, "assistant"),
    ];
  }

  const assistantText =
    extractMessageText(response.reply) ??
    extractMessageText(response.answer) ??
    extractMessageText(response.assistantReply) ??
    extractMessageText(response.response) ??
    extractMessageText(response.data) ??
    extractMessageText(response.message);

  return assistantText
    ? [
        {
          documentName: null,
          createdAt: new Date().toISOString(),
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          text: assistantText,
        },
      ]
    : [];
}

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
  const response = await apiClient.post<SendMessageResponse>(API_ENDPOINTS.home.sendMessages, {
    conversationId,
    message,
  });

  return getResponseMessages(response.data);
}

function getStreamChatUrl() {
  const baseURL = apiClient.defaults.baseURL;

  if (!baseURL) {
    throw new Error(APP_STRINGS.api.missingBaseUrl);
  }

  return `${baseURL.replace(/\/$/, "")}/${API_ENDPOINTS.home.streamMessage}`;
}

function parseSseBlock(block: string) {
  const event = block.match(/^event:\s*(.+)$/m)?.[1]?.trim();
  const dataRaw = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s?/, ""))
    .join("\n");

  if (!event || !dataRaw) {
    return null;
  }

  return {
    event,
    data: JSON.parse(dataRaw) as unknown,
  };
}

export async function streamChatMessage({
  conversationId,
  message,
  onDone,
  onError,
  onStart,
  onToken,
}: StreamChatMessagePayload) {
  const user = getAuth().currentUser;

  if (!user) {
    throw new Error(APP_STRINGS.auth.authenticationRequired);
  }

  const idToken = await getIdToken(user);
  const response = await fetch(getStreamChatUrl(), {
    body: JSON.stringify({ conversationId, message }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    method: "POST",
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start chat stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processBlock = (block: string) => {
    const parsedBlock = parseSseBlock(block);

    if (!parsedBlock) {
      return;
    }

    if (parsedBlock.event === "start") {
      onStart?.(parsedBlock.data as StreamStartEvent);
    }

    if (parsedBlock.event === "token") {
      const data = parsedBlock.data as { token?: unknown };

      if (typeof data.token === "string") {
        onToken?.(data.token);
      }
    }

    if (parsedBlock.event === "done") {
      onDone?.(parsedBlock.data as StreamDoneEvent);
    }

    if (parsedBlock.event === "error") {
      onError?.(parsedBlock.data as StreamErrorEvent);
    }
  };

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || "";

    for (const block of blocks) {
      processBlock(block);
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processBlock(buffer);
  }
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

  return messages.map<ConversationMessage>((message, index) =>
    normalizeApiMessage(message, `${conversationId}-${index}`),
  );
}
