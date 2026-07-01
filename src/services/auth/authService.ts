import { User } from "@/types/user";
import { auth } from "@/lib/firebase";
import { authenticatedFetch, getFirebaseIdToken } from "@/lib/firebase-auth-api";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface SocialLoginData {
  provider: "google" | "facebook";
  token: string;
  user: {
    email: string;
    name: string;
    avatar?: string;
    providerId: string;
  };
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  avatar?: string;
}

class FirebaseAuthService {
  private googleProvider = new GoogleAuthProvider();
  private facebookProvider = new FacebookAuthProvider();

  constructor() {
    this.googleProvider.addScope("email");
    this.googleProvider.addScope("profile");
    this.facebookProvider.addScope("email");
    this.facebookProvider.addScope("public_profile");
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    const token = await userCredential.user.getIdToken();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: credentials.email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email!,
      userData.password
    );

    await updateProfile(userCredential.user, {
      displayName: userData.name || "",
      photoURL: userData.avatar || "",
    });

    const token = await userCredential.user.getIdToken(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || "",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  }

  async logout(): Promise<void> {
    const token = await getFirebaseIdToken();
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => undefined);
    }
    await signOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            resolve(null);
            return;
          }

          const data = await response.json();
          resolve(data.user);
        } catch {
          resolve(null);
        }
      });
    });
  }

  async socialLogin(data: SocialLoginData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/social-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Social login failed");
    }

    return responseData;
  }

  async signInWithGooglePopup(): Promise<AuthResponse> {
    const result = await signInWithPopup(auth, this.googleProvider);
    const token = await result.user.getIdToken();
    return this.socialLogin({
      provider: "google",
      token,
      user: {
        email: result.user.email || "",
        name: result.user.displayName || "",
        avatar: result.user.photoURL || "",
        providerId: result.user.uid,
      },
    });
  }

  async signInWithFacebookPopup(): Promise<AuthResponse> {
    const result = await signInWithPopup(auth, this.facebookProvider);
    const token = await result.user.getIdToken();
    return this.socialLogin({
      provider: "facebook",
      token,
      user: {
        email: result.user.email || "",
        name: result.user.displayName || "",
        avatar: result.user.photoURL || "",
        providerId: result.user.uid,
      },
    });
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await authenticatedFetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update profile");
    }

    return responseData.user;
  }

  async getProfile(): Promise<User> {
    const response = await authenticatedFetch("/api/auth/me");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get profile");
    }

    return data.user;
  }
}

export const authService = new FirebaseAuthService();
