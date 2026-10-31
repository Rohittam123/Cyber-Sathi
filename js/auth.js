import {
  auth,
  createUserWithEmailAndPassword,
  firebaseReady,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "./firebase.js";

export function initAuth({ forms }) {
  const authForms = forms.map((form) => ({
    form,
    emailInput: form.querySelector("[data-auth-email]"),
    passwordInput: form.querySelector("[data-auth-password]"),
    submitButton: form.querySelector("[data-auth-submit]"),
    modeButton: form.querySelector("[data-auth-mode-toggle]"),
    resetButton: form.querySelector("[data-auth-reset]"),
    signOutButton: form.parentElement.querySelector("[data-auth-signout]"),
    status: form.querySelector("[data-auth-status]"),
  }));
  let isRegistering = false;
  let currentUser = null;
  let onUserChange = () => {};
  let resolveAuthReady;
  const authReady = new Promise((resolve) => {
    resolveAuthReady = resolve;
  });

  function setStatus(message, isError = false) {
    authForms.forEach(({ status }) => {
      status.textContent = message;
      status.classList.toggle("auth-status-error", isError);
    });
  }

  function updateMode() {
    authForms.forEach(({ submitButton, modeButton, passwordInput }) => {
      submitButton.innerHTML = isRegistering ? "Create account" : 'Sign in <span aria-hidden="true">→</span>';
      modeButton.textContent = isRegistering ? "I already have an account" : "Create account";
      passwordInput.autocomplete = isRegistering ? "new-password" : "current-password";
    });
  }

  if (!firebaseReady) {
    authForms.forEach(({ form, modeButton, resetButton }) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        setStatus("Add your Firebase web app settings in js/firebase-config.js to enable sign-in.", true);
      });
      modeButton.disabled = true;
      resetButton.disabled = true;
      modeButton.title = "Configure Firebase to enable accounts.";
    });
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

  authForms.forEach((authForm) => {
    authForm.modeButton.addEventListener("click", () => {
      isRegistering = !isRegistering;
      updateMode();
      setStatus(isRegistering
        ? "Create an account to save your analysis history. We’ll email you a verification link."
        : "Sign in to save your analysis history.");
    });

    authForm.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      authForm.submitButton.disabled = true;
      try {
        const email = authForm.emailInput.value.trim();
        if (isRegistering) {
          const credential = await createUserWithEmailAndPassword(auth, email, authForm.passwordInput.value);
          await sendEmailVerification(credential.user);
          await signOut(auth);
          authForm.form.reset();
          setStatus(`Verification email sent to ${email}. Open the link in that email, then sign in.`);
        } else {
          const credential = await signInWithEmailAndPassword(auth, email, authForm.passwordInput.value);
          if (!credential.user.emailVerified) {
            await sendEmailVerification(credential.user);
            await signOut(auth);
            authForm.form.reset();
            setStatus(`Please verify ${email} before signing in. We sent a fresh verification link.`);
            return;
          }
          authForm.form.reset();
          setStatus(`Signed in as ${credential.user.email}.`);
        }
      } catch (error) {
        const messages = {
          "auth/email-already-in-use": "An account already uses this email. Try signing in.",
          "auth/invalid-credential": "Email or password is incorrect.",
          "auth/weak-password": "Choose a password with at least 6 characters.",
          "auth/invalid-email": "Enter a valid email address.",
          "auth/operation-not-allowed": "Email/Password sign-in is disabled for this Firebase project. In Firebase Console, open Authentication → Sign-in method, enable Email/Password, and try again.",
          "auth/network-request-failed": "Could not connect. Check your internet connection and try again.",
          "auth/too-many-requests": "Too many attempts. Wait a little while, then try again.",
          "auth/user-disabled": "This account has been disabled. Contact the site administrator.",
        };
        setStatus(messages[error.code] || `Authentication failed: ${error.message}`, true);
      } finally {
        authForm.submitButton.disabled = false;
      }
    });

    authForm.resetButton.addEventListener("click", async () => {
      if (!authForm.emailInput.reportValidity()) return;
      authForm.resetButton.disabled = true;
      try {
        const email = authForm.emailInput.value.trim();
        await sendPasswordResetEmail(auth, email);
        setStatus(`Password reset email sent to ${email}. Check your inbox.`);
      } catch (error) {
        const message = error.code === "auth/user-not-found"
          ? "No account was found for that email address."
          : `Could not send a password reset email: ${error.message}`;
        setStatus(message, true);
      } finally {
        authForm.resetButton.disabled = false;
      }
    });

    authForm.signOutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        setStatus("Signed out.");
      } catch (error) {
        setStatus(`Could not sign out: ${error.message}`, true);
      }
    });
  });

  onAuthStateChanged(
    auth,
    (user) => {
      currentUser = user?.emailVerified ? user : null;
      resolveAuthReady(currentUser);
      authForms.forEach(({ form, signOutButton }) => {
        form.classList.toggle("hidden", Boolean(currentUser));
        signOutButton.classList.toggle("hidden", !user);
      });
      if (currentUser) setStatus(`Signed in as ${currentUser.email}.`);
      else if (user) setStatus("Verify your email address to access your account. Sign in to send a fresh verification link.");
      else if (authForms.some(({ status }) => status.textContent.startsWith("Signed in"))) {
        setStatus("Sign in to save your analysis history.");
      }
      onUserChange(currentUser);
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
