import { getAuth, signOut } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_STRINGS } from "@/constants/strings";
import { ROUTES } from "@/constants/routes";
import { COLORS, LAYOUT, RADII, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useChatComposer } from "@/providers/chat-composer-provider";
import { getCurrentUser, type AppUser } from "@/services/user";

const CONVERSATIONS = APP_STRINGS.drawer.conversations;

export function AppDrawerContent() {
  const { startNewChat } = useChatComposer();
  const firebaseUser = getAuth().currentUser;
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const name = user?.name ?? firebaseUser?.displayName ?? APP_STRINGS.home.defaultName;
  const photoURL = user?.photoURL ?? firebaseUser?.photoURL;

  const handleNewChat = () => {
    startNewChat();
    router.replace(ROUTES.home);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.brandRow}>
        {photoURL ? (
          <Image source={photoURL} style={styles.headerAvatar} contentFit="cover" />
        ) : (
          <View style={styles.headerAvatarFallback}>
            <Text style={styles.headerAvatarInitial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.brandText}>
          <Text style={styles.brandName}>{APP_STRINGS.drawer.appName}</Text>
          <Text numberOfLines={1} style={styles.userName}>{name}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.home.signOutAccessibilityLabel}
          onPress={() => signOut(getAuth())}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
        >
          <SymbolView
            name={APP_STRINGS.symbols.signOut}
            size={LAYOUT.drawerActionIconSize}
            tintColor={COLORS.textSecondary}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.historyContent}
        showsVerticalScrollIndicator={false}
        style={styles.historyScroll}
      >
        <Text style={styles.sectionTitle}>{APP_STRINGS.drawer.history}</Text>
        <View style={styles.historyList}>
          {CONVERSATIONS.map((conversation) => (
            <Pressable
              accessibilityRole="button"
              key={conversation}
              style={({ pressed }) => [styles.historyItem, pressed && styles.historyItemPressed]}
            >
              <View style={styles.historyIcon}>
                <SymbolView
                  name={APP_STRINGS.symbols.chat}
                  size={LAYOUT.drawerHistoryIconSize}
                  tintColor={COLORS.textSecondary}
                />
              </View>
              <Text numberOfLines={1} style={styles.historyText}>
                {conversation}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.drawerFooter}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.chat.newChatAccessibilityLabel}
          onPress={handleNewChat}
          style={({ pressed }) => [styles.newChatButton, pressed && styles.pressed]}
        >
          <SymbolView
            name={APP_STRINGS.symbols.newChat}
            size={LAYOUT.drawerActionIconSize}
            tintColor={COLORS.surface}
          />
          <Text style={styles.newChatText}>{APP_STRINGS.drawer.newChat}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: LAYOUT.flex, backgroundColor: COLORS.surface },
  brandRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: LAYOUT.borderWidth,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  headerAvatar: {
    width: LAYOUT.drawerHeaderAvatarSize,
    height: LAYOUT.drawerHeaderAvatarSize,
    borderRadius: RADII.pill,
  },
  headerAvatarFallback: {
    width: LAYOUT.drawerHeaderAvatarSize,
    height: LAYOUT.drawerHeaderAvatarSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  headerAvatarInitial: {
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.feature,
    fontWeight: "800",
  },
  brandText: { flex: LAYOUT.flex },
  brandName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.drawerBrand,
    fontWeight: "800",
  },
  userName: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.legal,
  },
  headerAction: {
    width: LAYOUT.drawerHeaderActionSize,
    height: LAYOUT.drawerHeaderActionSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  historyScroll: { flex: LAYOUT.flex },
  historyContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  sectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: "700",
    letterSpacing: TYPOGRAPHY.letterSpacing,
    textTransform: "uppercase",
  },
  historyList: { gap: SPACING.xs },
  historyItem: {
    minHeight: LAYOUT.drawerHistoryHeight,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  historyItemPressed: { backgroundColor: COLORS.surfaceMuted },
  historyIcon: {
    width: LAYOUT.drawerHistoryIconContainer,
    height: LAYOUT.drawerHistoryIconContainer,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  historyText: { flex: LAYOUT.flex, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.feature },
  drawerFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderTopWidth: LAYOUT.borderWidth,
    borderTopColor: COLORS.border,
  },
  newChatButton: {
    width: "100%",
    height: LAYOUT.drawerNewChatHeight,
    borderRadius: RADII.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  newChatText: { color: COLORS.surface, fontSize: TYPOGRAPHY.button, fontWeight: "700" },
  pressed: { opacity: LAYOUT.pressedOpacity },
});
