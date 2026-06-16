import * as DocumentPicker from "expo-document-picker";
import { SymbolView } from "expo-symbols";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_STRINGS } from "@/constants/strings";
import { COLORS, LAYOUT, RADII, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useChatComposer } from "@/providers/chat-composer-provider";

export default function HomeScreen() {
  const { document, message, setDocument, setMessage } = useChatComposer();

  const canSend = Boolean(message.trim() || document);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [...APP_STRINGS.chat.acceptedDocumentTypes],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      setDocument(result.assets[0]);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.contentArea}>
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
        </View>

        <View style={styles.composerArea}>
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
                  tintColor={COLORS.textSecondary}
                />
              </Pressable>
              <TextInput
                multiline
                onChangeText={setMessage}
                placeholder={APP_STRINGS.chat.placeholder}
                placeholderTextColor={COLORS.textSecondary}
                style={styles.input}
                value={message}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={APP_STRINGS.chat.sendAccessibilityLabel}
                disabled={!canSend}
                style={({ pressed }) => [
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                  pressed && canSend && styles.pressed,
                ]}
              >
                <SymbolView
                  name={APP_STRINGS.symbols.send}
                  size={LAYOUT.composerIconSize}
                  tintColor={COLORS.surface}
                />
              </Pressable>
            </View>
            <Text style={styles.helperText}>{APP_STRINGS.chat.helper}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: LAYOUT.flex, backgroundColor: COLORS.background },
  keyboardView: { flex: LAYOUT.flex },
  contentArea: {
    flex: LAYOUT.flex,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
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
    borderRadius: RADII.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
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
  suggestionRow: {
    marginTop: SPACING.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  suggestion: {
    minWidth: LAYOUT.chatSuggestionMinWidth,
    maxWidth: LAYOUT.chatSuggestionWidth,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    backgroundColor: COLORS.surface,
  },
  suggestionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.feature,
    lineHeight: TYPOGRAPHY.suggestionLineHeight,
    textAlign: "center",
  },
  composerArea: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
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
    borderRadius: RADII.md,
    backgroundColor: COLORS.primarySoft,
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
    alignItems: "flex-end",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  composerAction: {
    width: LAYOUT.composerActionSize,
    height: LAYOUT.composerActionSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: LAYOUT.flex,
    maxHeight: LAYOUT.composerInputMaxHeight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
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
  helperText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.legal,
    textAlign: "center",
  },
  pressed: { opacity: LAYOUT.pressedOpacity },
});
