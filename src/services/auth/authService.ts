import { User } from '@/types/user';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface SocialLoginData {
  provider: 'google' | 'facebook';
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

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

// Firestore Auth Service (for production/Vercel)
class FirestoreAuthService {
  private googleProvider = new GoogleAuthProvider();
  private facebookProvider = new FacebookAuthProvider();

  constructor() {
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
    
    this.facebookProvider.addScope('email');
    this.facebookProvider.addScope('public_profile');
  }

  private async createUserDocument(firebaseUser: any, additionalData?: any) {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL, uid } = firebaseUser;
      const createdAt = serverTimestamp();

      const userData = {
        id: uid,
        name: displayName || additionalData?.name || '',
        email: email || '',
        avatar: photoURL || additionalData?.avatar || '',
        role: 'user',
        is_active: true,
        email_verified: firebaseUser.emailVerified || false,
        created_at: createdAt,
        updated_at: createdAt,
        last_login_at: createdAt,
        provider: additionalData?.provider || 'email',
        provider_id: uid,
        ...additionalData
      };

      try {
        await setDoc(userDocRef, userData);
        
        // Log activity
        await addDoc(collection(db, 'user_activity_logs'), {
          userId: uid,
          action: 'user_registered',
          details: { provider: userData.provider },
          timestamp: serverTimestamp(),
          ip_address: null
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }

    return userSnapshot.exists() ? userSnapshot.data() : null;
  }

  private async updateUserLastLogin(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        last_login_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const firebaseUser = userCredential.user;
      await this.updateUserLastLogin(firebaseUser.uid);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      if (!userData || !userData.is_active) {
        throw new Error('Account is disabled');
      }

      const token = await firebaseUser.getIdToken();

      return {
        user: {
          id: parseInt(firebaseUser.uid.slice(-8), 16), // Convert to number for compatibility
          email: firebaseUser.email || '',
          name: userData.name || firebaseUser.displayName || '',
          role: userData.role || 'user',
          avatar: userData.avatar || firebaseUser.photoURL || undefined,
          is_active: userData.is_active || true,
          email_verified: firebaseUser.emailVerified,
          created_at: userData.created_at?.toDate()?.toISOString() || new Date().toISOString(),
          updated_at: userData.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
          last_login_at: userData.last_login_at?.toDate()?.toISOString() || new Date().toISOString(),
          provider: userData.provider === 'email' ? 'local' : userData.provider || 'local'
        },
        token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email!,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });

      // Create Firestore document
      await this.createUserDocument(firebaseUser, {
        name: userData.name,
        provider: 'email'
      });

      const token = await firebaseUser.getIdToken();

      return {
        user: {
          id: parseInt(firebaseUser.uid.slice(-8), 16),
          email: firebaseUser.email || '',
          name: userData.name || '',
          role: 'user',
          avatar: undefined,
          is_active: true,
          email_verified: firebaseUser.emailVerified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          provider: 'local'
        },
        token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.data();

                         if (userData) {
               resolve({
                 id: parseInt(firebaseUser.uid.slice(-8), 16),
                 email: firebaseUser.email || '',
                 name: userData.name || firebaseUser.displayName || '',
                 role: userData.role || 'user',
                 avatar: userData.avatar || firebaseUser.photoURL || undefined,
                 is_active: userData.is_active || true,
                 email_verified: firebaseUser.emailVerified,
                 created_at: userData.created_at?.toDate()?.toISOString() || new Date().toISOString(),
                 updated_at: userData.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
                 last_login_at: userData.last_login_at?.toDate()?.toISOString() || new Date().toISOString(),
                 provider: userData.provider === 'email' ? 'local' : userData.provider || 'local'
               });
             } else {
               resolve(null);
             }
          } catch (error) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  async socialLogin(data: SocialLoginData): Promise<AuthResponse> {
    try {
      let result;
      
      if (data.provider === 'google') {
        result = await signInWithPopup(auth, this.googleProvider);
      } else if (data.provider === 'facebook') {
        result = await signInWithPopup(auth, this.facebookProvider);
      } else {
        throw new Error('Unsupported provider');
      }

      const firebaseUser = result.user;
      
      // Create or update user document
      await this.createUserDocument(firebaseUser, {
        provider: data.provider,
        name: data.user.name || firebaseUser.displayName,
        avatar: data.user.avatar || firebaseUser.photoURL
      });

      await this.updateUserLastLogin(firebaseUser.uid);

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      const token = await firebaseUser.getIdToken();

             return {
         user: {
           id: parseInt(firebaseUser.uid.slice(-8), 16),
           email: firebaseUser.email || '',
           name: userData?.name || firebaseUser.displayName || '',
           role: userData?.role || 'user',
           avatar: userData?.avatar || firebaseUser.photoURL || undefined,
           is_active: userData?.is_active || true,
           email_verified: firebaseUser.emailVerified,
           created_at: userData?.created_at?.toDate()?.toISOString() || new Date().toISOString(),
           updated_at: userData?.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
           last_login_at: userData?.last_login_at?.toDate()?.toISOString() || new Date().toISOString(),
           provider: data.provider
         },
         token
       };
    } catch (error: any) {
      throw new Error(error.message || 'Social login failed');
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData: any = {
        updated_at: serverTimestamp()
      };

      if (data.name) {
        updateData.name = data.name;
        await updateProfile(currentUser, { displayName: data.name });
      }

      if (data.avatar) {
        updateData.avatar = data.avatar;
        await updateProfile(currentUser, { photoURL: data.avatar });
      }

      await updateDoc(userDocRef, updateData);

      const updatedDoc = await getDoc(userDocRef);
      const userData = updatedDoc.data();

             return {
         id: parseInt(currentUser.uid.slice(-8), 16),
         email: currentUser.email || '',
         name: userData?.name || currentUser.displayName || '',
         role: userData?.role || 'user',
         avatar: userData?.avatar || currentUser.photoURL || undefined,
         is_active: userData?.is_active || true,
         email_verified: currentUser.emailVerified,
         created_at: userData?.created_at?.toDate()?.toISOString() || new Date().toISOString(),
         updated_at: userData?.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
         last_login_at: userData?.last_login_at?.toDate()?.toISOString() || new Date().toISOString(),
         provider: userData?.provider === 'email' ? 'local' : userData?.provider || 'local'
       };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async getProfile(): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User data not found');
    }

         return {
       id: parseInt(currentUser.uid.slice(-8), 16),
       email: currentUser.email || '',
       name: userData.name || currentUser.displayName || '',
       role: userData.role || 'user',
       avatar: userData.avatar || currentUser.photoURL || undefined,
       is_active: userData.is_active || true,
       email_verified: currentUser.emailVerified,
       created_at: userData.created_at?.toDate()?.toISOString() || new Date().toISOString(),
       updated_at: userData.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
       last_login_at: userData.last_login_at?.toDate()?.toISOString() || new Date().toISOString(),
       provider: userData.provider === 'email' ? 'local' : userData.provider || 'local'
     };
  }
}

// Original MySQL Auth Service (for local development)
class AuthService {
  private static instance: AuthService;
  private baseUrl = '/api/auth';

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`);
      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      return data.user;
    } catch (error) {
      return null;
    }
  }

  async socialLogin(data: SocialLoginData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Social login failed');
    }

    return responseData;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update profile');
    }

    return responseData.user;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/profile`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }

    return data.user;
  }
}

// Export the appropriate service based on environment
export const authService = isProduction 
  ? new FirestoreAuthService() 
  : AuthService.getInstance();