import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

type KeyboardState = {
  height: number;
  isVisible: boolean;
};

const INITIAL_KEYBOARD_STATE: KeyboardState = {
  height: 0,
  isVisible: false,
};

export function useKeyboard() {
  const [keyboard, setKeyboard] = useState<KeyboardState>(INITIAL_KEYBOARD_STATE);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboard({
        height: event.endCoordinates.height,
        isVisible: true,
      });
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboard(INITIAL_KEYBOARD_STATE);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboard;
}
