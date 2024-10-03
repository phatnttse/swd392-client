import { Injectable } from '@angular/core';

import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth'; // Cập nhật import

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async logout() {
    return this.auth.signOut();
  }
}
