import * as DocumentPicker from "expo-document-picker";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { APP_STRINGS } from "@/constants/strings";
import { COLORS, LAYOUT, RADII, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useKeyboard } from "@/hooks/useKeyboard";
import type { ConversationMessage } from "@/services/chat";
import {
  useConversationMessagesQuery,
  useCreateConversationMutation,
  useSendChatMessageMutation,
  useUploadDocumentMutation,
} from "@/services/chat-queries";
import { useChatStore } from "@/stores/chat-store";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return APP_STRINGS.chat.sendErrorMessage;
}

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const chatBubbles = useChatStore((state) => state.chatBubbles);
  const conversationId = useChatStore((state) => state.conversationId);
  const document = useChatStore((state) => state.document);
  const message = useChatStore((state) => state.message);
  const setChatBubbles = useChatStore((state) => state.setChatBubbles);
  const setConversationId = useChatStore((state) => state.setConversationId);
  const setDocument = useChatStore((state) => state.setDocument);
  const setMessage = useChatStore((state) => state.setMessage);
  const createConversationMutation = useCreateConversationMutation();
  const conversationMessagesQuery =
    useConversationMessagesQuery(conversationId);
  const sendMessageMutation = useSendChatMessageMutation();
  const uploadDocumentMutation = useUploadDocumentMutation();
  const keyboard = useKeyboard();
  const insets = useSafeAreaInsets();

  const serverMessages = conversationMessagesQuery.data ?? [];
  const visibleMessages =
    serverMessages.length > 0
      ? serverMessages
      : chatBubbles.map<ConversationMessage>((bubble) => ({
          documentName: bubble.document?.name ?? null,
          id: bubble.id,
          role: "user",
          text: bubble.text,
        }));
  const trimmedMessage = message.trim();
  const isSending =
    createConversationMutation.isPending ||
    sendMessageMutation.isPending ||
    uploadDocumentMutation.isPending;
  const canSend = Boolean((trimmedMessage || document) && !isSending);
  const keyboardOffset = keyboard.isVisible
    ? Math.max(keyboard.height - insets.bottom, 0)
    : 0;

  const scrollToLatestMessage = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    if (visibleMessages.length > 0 && !conversationMessagesQuery.isLoading) {
      scrollToLatestMessage();
    }
  }, [
    conversationMessagesQuery.isLoading,
    scrollToLatestMessage,
    visibleMessages.length,
  ]);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [...APP_STRINGS.chat.acceptedDocumentTypes],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const selectedDocument = result.assets[0];

      if (selectedDocument.mimeType !== "application/pdf") {
        Alert.alert(
          APP_STRINGS.chat.sendErrorTitle,
          APP_STRINGS.chat.uploadErrorMessage,
        );
        return;
      }

      setDocument(selectedDocument);
    }
  };

  const handleSendMessage = async () => {
    if (!canSend) {
      return;
    }

    Keyboard.dismiss();

    try {
      console.log("[sendMessage] start", {
        hasDocument: Boolean(document),
        hasMessage: Boolean(trimmedMessage),
        selectedConversationId: conversationId,
      });

      const conversationTitle =
        trimmedMessage ||
        document?.name ||
        APP_STRINGS.chat.defaultConversationTitle;
      const activeConversationId =
        conversationId ??
        (await createConversationMutation.mutateAsync(conversationTitle));

      if (!conversationId) {
        setConversationId(activeConversationId);
      }

      if (document) {
        console.log("[sendMessage] uploading document", {
          name: document.name,
          mimeType: document.mimeType,
          uri: document.uri,
        });
        await uploadDocumentMutation.mutateAsync({ document });
      }

      if (trimmedMessage) {
        console.log("[sendMessage] sending text message", {
          conversationId: activeConversationId,
        });
        await sendMessageMutation.mutateAsync({
          conversationId: activeConversationId,
          message: trimmedMessage,
        });
      }

      setChatBubbles((currentBubbles) => [
        ...currentBubbles,
        {
          id: `${Date.now()}`,
          document,
          text: trimmedMessage,
        },
      ]);
      setMessage("");
      setDocument(null);
      scrollToLatestMessage();
    } catch (error) {
      console.log("[sendMessage] failed", error);
      Alert.alert(APP_STRINGS.chat.sendErrorTitle, getErrorMessage(error));
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.contentArea,
            keyboard.isVisible && styles.contentAreaKeyboardVisible,
            visibleMessages.length > 0 && styles.chatContentArea,
          ]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (visibleMessages.length > 0) {
              scrollToLatestMessage();
            }
          }}
          showsVerticalScrollIndicator={false}
        >
          {conversationMessagesQuery.isLoading ? (
            <View style={styles.historyLoader}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : visibleMessages.length > 0 ? (
            <View style={styles.bubbleList}>
              {visibleMessages.map((bubble) => (
                <View
                  key={bubble.id}
                  style={[
                    styles.messageBubble,
                    bubble.role === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble,
                  ]}
                >
                  {bubble.documentName ? (
                    <View style={styles.bubbleDocument}>
                      <SymbolView
                        name={APP_STRINGS.symbols.document}
                        size={LAYOUT.composerIconSize}
                        tintColor={COLORS.primaryDark}
                      />
                      <Text numberOfLines={1} style={styles.bubbleDocumentName}>
                        {bubble.documentName}
                      </Text>
                    </View>
                  ) : null}
                  {bubble.text ? (
                    <Text
                      style={[
                        styles.messageBubbleText,
                        bubble.role === "assistant"
                          ? styles.assistantBubbleText
                          : styles.userBubbleText,
                      ]}
                    >
                      {bubble.text}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.heroIcon}>
                <SymbolView
                  name={APP_STRINGS.symbols.hero}
                  size={LAYOUT.chatHeroIconSize}
                  tintColor={COLORS.primary}
                />
              </View>
              <Text style={styles.title}>{APP_STRINGS.chat.title}</Text>
              <Text style={styles.description}>
                {APP_STRINGS.chat.description}
              </Text>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.composerArea,
            { paddingBottom: SPACING.md + keyboardOffset },
          ]}
        >
          <View style={styles.composerContent}>
            {document ? (
              <View style={styles.documentChip}>
                <SymbolView
                  name={APP_STRINGS.symbols.document}
                  size={LAYOUT.composerIconSize}
                  tintColor={COLORS.primary}
                />
                <Text numberOfLines={1} style={styles.documentName}>
                  {document.name}
                </Text>
                <Pressable
                  onPress={() => setDocument(null)}
                  hitSlop={SPACING.sm}
                >
                  <SymbolView
                    name={APP_STRINGS.symbols.close}
                    size={LAYOUT.composerSmallIconSize}
                    tintColor={COLORS.textSecondary}
                  />
                </Pressable>
              </View>
            ) : null}

            <View style={styles.composer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={APP_STRINGS.chat.uploadAccessibilityLabel}
                onPress={handlePickDocument}
                style={({ pressed }) => [
                  styles.composerAction,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={APP_STRINGS.symbols.attach}
                  size={LAYOUT.composerIconSize}
                  tintColor={COLORS.primary}
                />
              </Pressable>
              <TextInput
                submitBehavior="blurAndSubmit"
                multiline
                onChangeText={setMessage}
                placeholder={APP_STRINGS.chat.placeholder}
                placeholderTextColor={COLORS.textSecondary}
                returnKeyType="default"
                style={styles.input}
                textAlignVertical="center"
                value={message}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={APP_STRINGS.chat.sendAccessibilityLabel}
                disabled={!canSend}
                onPress={handleSendMessage}
                style={({ pressed }) => [
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                  pressed && canSend && styles.pressed,
                ]}
              >
                {isSending ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <SymbolView
                    name={APP_STRINGS.symbols.send}
                    size={LAYOUT.composerIconSize}
                    tintColor={COLORS.surface}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: LAYOUT.flex, backgroundColor: COLORS.background },
  screen: { flex: LAYOUT.flex },
  contentArea: {
    flexGrow: LAYOUT.flex,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  contentAreaKeyboardVisible: {
    justifyContent: "flex-start",
    paddingTop: SPACING.xl,
  },
  chatContentArea: {
    alignItems: "stretch",
    justifyContent: "flex-end",
    paddingTop: SPACING.lg,
  },
  bubbleList: {
    width: "100%",
    maxWidth: LAYOUT.composerMaxWidth,
    alignSelf: "center",
    gap: SPACING.sm,
  },
  historyLoader: {
    minHeight: LAYOUT.drawerHistoryHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.lg,
    gap: SPACING.sm,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  messageBubbleText: {
    fontSize: TYPOGRAPHY.body,
    lineHeight: TYPOGRAPHY.bodyLineHeight,
  },
  assistantBubbleText: {
    color: COLORS.textPrimary,
  },
  userBubbleText: {
    color: COLORS.surface,
  },
  bubbleDocument: {
    minHeight: LAYOUT.drawerHistoryIconContainer,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primarySoft,
  },
  bubbleDocumentName: {
    flex: LAYOUT.flex,
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.feature,
    fontWeight: "600",
  },
  emptyState: {
    width: "100%",
    maxWidth: LAYOUT.chatContentWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    width: LAYOUT.chatHeroSize,
    height: LAYOUT.chatHeroSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    marginTop: SPACING.lg,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.title,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    maxWidth: LAYOUT.chatDescriptionWidth,
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
    lineHeight: TYPOGRAPHY.bodyLineHeight,
    textAlign: "center",
  },
  composerArea: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: LAYOUT.borderWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  composerContent: {
    width: "100%",
    maxWidth: LAYOUT.composerMaxWidth,
  },
  documentChip: {
    alignSelf: "flex-start",
    flexShrink: 1,
    maxWidth: LAYOUT.documentChipWidth,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  documentName: {
    flex: LAYOUT.flex,
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.feature,
  },
  composer: {
    minHeight: LAYOUT.composerMinHeight,
    maxHeight: LAYOUT.composerMaxHeight,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  composerAction: {
    width: LAYOUT.composerActionSize,
    height: LAYOUT.composerActionSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  input: {
    flex: LAYOUT.flex,
    minHeight: LAYOUT.composerActionSize,
    maxHeight: LAYOUT.composerInputMaxHeight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 0,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    lineHeight: TYPOGRAPHY.bodyLineHeight,
  },
  sendButton: {
    width: LAYOUT.composerActionSize,
    height: LAYOUT.composerActionSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  sendButtonDisabled: { backgroundColor: COLORS.border },
  pressed: { opacity: LAYOUT.pressedOpacity },
});
