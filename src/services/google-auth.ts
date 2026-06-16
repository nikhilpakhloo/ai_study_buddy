import {
  getAuth,
  getIdToken,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import { publicApiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { APP_STRINGS } from "@/constants/strings";

GoogleOneTapSignIn.configure({ webClientId: APP_STRINGS.google.webClientId });

export async function signInWithGoogle(): Promise<void> {
  await GoogleOneTapSignIn.checkPlayServices();

  const response = await GoogleOneTapSignIn.presentExplicitSignIn();

  if (isCancelledResponse(response)) {
    return;
  }

  if (!isSuccessResponse(response)) {
    throw new Error(APP_STRINGS.auth.errorMessage);
  }

  const googleCredential = GoogleAuthProvider.credential(response.data.idToken);
  console.log("idtoken", googleCredential);
  const auth = getAuth();
  const userCredential = await signInWithCredential(auth, googleCredential);

  try {
    const firebaseIdToken = await getIdToken(userCredential.user);
    console.log("FirebaseIdtoken", firebaseIdToken);
    await publicApiClient.post(API_ENDPOINTS.auth.socialLogin, {
      idToken: firebaseIdToken,
    });
  } catch (error) {
    await signOut(auth);
    throw error;
  }
}
