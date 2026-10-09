import {
  auth,
  createUserWithEmailAndPassword,
  firebaseReady,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "./firebase.js";

export function initAuth({ form, emailInput, passwordInput, submitButton, modeButton, signOutButton, status }) {
  let isRegistering = false;
  let currentUser = null;
  let onUserChange = () => {};
  let resolveAuthReady;
  const authReady = new Promise((resolve) => {
    resolveAuthReady = resolve;
  });

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.style.color = isError ? "#ff9f89" : "";
  }

  if (!firebaseReady) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      setStatus("Add your Firebase web app settings in js/firebase-config.js to enable sign-in.", true);
    });
    modeButton.disabled = true;
    modeButton.title = "Configure Firebase to enable accounts.";
    setStatus("Configure Firebase to enable sign-in and saved analysis history.");
    return {
      getUser: () => null,
      waitForUser: () => Promise.resolve(null),
      setOnUserChange: (callback) => {
        onUserChange = callback;
        onUserChange(null);
      },
    };
  }

  modeButton.addEventListener("click", () => {
    isRegistering = !isRegistering;
    submitButton.textContent = isRegistering ? "Create account" : "Sign in";
    modeButton.textContent = isRegistering ? "I already have an account" : "Create account";
    passwordInput.autocomplete = isRegistering ? "new-password" : "current-password";
    setStatus(isRegistering ? "Create an account to save your analysis history." : "Sign in to save your analysis history.");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
      } else {
        await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
      }
      form.reset();
      setStatus(isRegistering ? "Account created and signed in." : "Signed in successfully.");
    } catch (error) {
      const messages = {
        "auth/email-already-in-use": "An account already uses this email. Try signing in.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/weak-password": "Choose a password with at least 6 characters.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/operation-not-allowed": "Email/Password sign-in is disabled for this Firebase project. In Firebase Console, open Authentication → Sign-in method, enable Email/Password, and try again.",
        "auth/network-request-failed": "Could not connect. Check your internet connection and try again.",
      };
      setStatus(messages[error.code] || `Authentication failed: ${error.message}`, true);
    } finally {
      submitButton.disabled = false;
    }
  });

  signOutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      setStatus("Signed out.");
    } catch (error) {
      setStatus(`Could not sign out: ${error.message}`, true);
    }
  });

  onAuthStateChanged(
    auth,
    (user) => {
      currentUser = user;
      resolveAuthReady(user);
      form.classList.toggle("hidden", Boolean(user));
      signOutButton.classList.toggle("hidden", !user);
      if (user) setStatus(`Signed in as ${user.email}.`);
      else if (status.textContent.startsWith("Signed in")) setStatus("Sign in to save your analysis history.");
      onUserChange(user);
    },
    (error) => {
      console.error("Could not restore Firebase authentication state.", error);
      resolveAuthReady(null);
      setStatus(`Could not check your sign-in status: ${error.message}`, true);
    },
  );

  return {
    getUser: () => currentUser,
    waitForUser: () => authReady,
    setOnUserChange: (callback) => {
      onUserChange = callback;
      onUserChange(currentUser);
    },
  };
}
