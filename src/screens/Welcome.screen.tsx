import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_STRINGS } from "@/constants/strings";
import {
  COLORS,
  LAYOUT,
  RADII,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";
import { signInWithGoogle } from "@/services/google-auth";

const FEATURES = [
  {
    label: APP_STRINGS.welcome.featureFocus,
    symbol: APP_STRINGS.symbols.focus,
    color: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  {
    label: APP_STRINGS.welcome.featureAnswers,
    symbol: APP_STRINGS.symbols.answers,
    color: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  {
    label: APP_STRINGS.welcome.featureMomentum,
    symbol: APP_STRINGS.symbols.momentum,
    color: COLORS.mint,
    backgroundColor: COLORS.mintSoft,
  },
] as const;

export default function WelcomScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch {
      Alert.alert(APP_STRINGS.auth.errorTitle, APP_STRINGS.auth.errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.decorativeLarge} />
            <View style={styles.decorativeSmall} />
            <View style={styles.sparkleTop}>
              <SymbolView
                name={APP_STRINGS.symbols.sparkle}
                size={LAYOUT.smallSymbolSize}
                tintColor={COLORS.accent}
              />
            </View>
            <View style={styles.bookBadge}>
              <SymbolView
                name={APP_STRINGS.symbols.book}
                size={LAYOUT.smallSymbolSize}
                tintColor={COLORS.mint}
              />
            </View>
            <View style={styles.heroIconCard}>
              <SymbolView
                name={APP_STRINGS.symbols.hero}
                size={LAYOUT.heroIconSize}
                tintColor={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.badge}>
            <SymbolView
              name={APP_STRINGS.symbols.sparkle}
              size={LAYOUT.featureIconSize}
              tintColor={COLORS.primary}
            />
            <Text style={styles.badgeText}>{APP_STRINGS.welcome.badge}</Text>
          </View>

          <Text style={styles.title}>{APP_STRINGS.welcome.title}</Text>
          <Text style={styles.description}>
            {APP_STRINGS.welcome.description}
          </Text>

          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <View key={feature.label} style={styles.feature}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.backgroundColor },
                  ]}
                >
                  <SymbolView
                    name={feature.symbol}
                    size={LAYOUT.featureIconSize}
                    tintColor={feature.color}
                  />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              APP_STRINGS.welcome.googleButtonAccessibilityLabel
            }
            disabled={isSigningIn}
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googleButtonPressed,
              isSigningIn && styles.googleButtonLoading,
            ]}
          >
            {isSigningIn ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <>
                <View style={styles.googleMarkContainer}>
                  <Text style={styles.googleMark}>
                    {APP_STRINGS.google.mark}
                  </Text>
                </View>
                <Text style={styles.googleButtonText}>
                  {APP_STRINGS.welcome.googleButton}
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.legal}>{APP_STRINGS.welcome.legalPrefix}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: LAYOUT.flex,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: LAYOUT.flex,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  content: {
    width: "100%",
    maxWidth: LAYOUT.contentMaxWidth,
    alignSelf: "center",
    alignItems: "center",
  },
  hero: {
    width: "100%",
    height: LAYOUT.heroHeight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  decorativeLarge: {
    position: "absolute",
    width: LAYOUT.decorativeLarge,
    height: LAYOUT.decorativeLarge,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primarySoft,
    top: LAYOUT.decorativeOffset,
    right: LAYOUT.decorativeOffset,
  },
  decorativeSmall: {
    position: "absolute",
    width: LAYOUT.decorativeSmall,
    height: LAYOUT.decorativeSmall,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.mintSoft,
    bottom: LAYOUT.decorativeOffset,
    left: LAYOUT.decorativeOffset,
  },
  heroIconCard: {
    width: LAYOUT.heroIconCardSize,
    height: LAYOUT.heroIconCardSize,
    borderRadius: RADII.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    transform: [{ rotate: "-4deg" }],
    ...SHADOWS.card,
  },
  sparkleTop: {
    position: "absolute",
    top: SPACING.lg,
    left: SPACING.xl,
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accentSoft,
  },
  bookBadge: {
    position: "absolute",
    right: SPACING.xl,
    bottom: SPACING.lg,
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.mintSoft,
    transform: [{ rotate: "7deg" }],
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surfaceMuted,
  },
  badgeText: {
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: "700",
    letterSpacing: TYPOGRAPHY.letterSpacing,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heroTitle,
    lineHeight: TYPOGRAPHY.heroLineHeight,
    fontWeight: "900",
    textAlign: "center",
    marginTop: SPACING.lg,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
    lineHeight: TYPOGRAPHY.bodyLineHeight,
    textAlign: "center",
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  features: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  feature: {
    flex: LAYOUT.flex,
    alignItems: "center",
    gap: SPACING.sm,
  },
  featureIcon: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.feature,
    fontWeight: "600",
    textAlign: "center",
  },
  googleButton: {
    width: "100%",
    height: LAYOUT.buttonHeight,
    marginTop: SPACING.xxl,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.googleBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    ...SHADOWS.button,
  },
  googleButtonPressed: {
    transform: [{ scale: LAYOUT.pressedScale }],
  },
  googleButtonLoading: {
    opacity: LAYOUT.loadingOpacity,
  },
  googleMarkContainer: {
    width: LAYOUT.googleMarkSize,
    height: LAYOUT.googleMarkSize,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  googleMark: {
    color: COLORS.googleBlue,
    fontSize: TYPOGRAPHY.body,
    fontWeight: "900",
  },
  googleButtonText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.button,
    fontWeight: "700",
  },
  legal: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.legal,
    lineHeight: TYPOGRAPHY.body,
    textAlign: "center",
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
});
