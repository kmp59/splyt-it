// Single import point for auth — picks local or Firebase based on VITE_DATA_MODE.
// Both modules are imported statically; only one is ever called at runtime.
// Firebase is not initialised when VITE_DATA_MODE=local (see src/firebase.js).

import * as localAuth from './local/auth'
import * as firebaseAuth from './firebase/auth'

const impl = import.meta.env.VITE_DATA_MODE === 'local' ? localAuth : firebaseAuth

export const signIn = impl.signIn
export const signUp = impl.signUp
export const signOut = impl.signOut
export const onAuthStateChanged = impl.onAuthStateChanged
