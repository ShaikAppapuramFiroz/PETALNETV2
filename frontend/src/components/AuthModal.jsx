import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";

function AuthModal({ onClose, canClose = true }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setConfirmPassword("");
    setShowReset(false);
    setResetEmail("");
  }, [mode]);

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      toast.success("Account created. Welcome!");
      onClose?.();
    } catch (e) {
      toast.error(e.message || "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully.");
      onClose?.();
    } catch (e) {
      toast.error(e.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email.");
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent.");
      setShowReset(false);
    } catch (e) {
      toast.error(e.message || "Could not send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay auth-modal" onClick={() => canClose && onClose?.()}>
      <div className="modal-content auth-content" onClick={(e) => e.stopPropagation()}>
        {canClose && (
          <button className="close-modal-btn" onClick={onClose} aria-label="Close">✕</button>
        )}
        <div className="welcome-note">
          <h2>Welcome to PetalNetV2</h2>
          <p>Sign in to classify flowers, view results, and manage your profile.</p>
        </div>
        <div className={`auth-card ${mode === "signup" ? "flip" : ""}`}>
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {!showReset ? (
            <div className="auth-panels">
              <div className={`auth-panel ${mode === "login" ? "shown" : "hidden"}`}>
                <h3 className="auth-title">Welcome back</h3>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="auth-actions">
                  <button
                    className="link-btn"
                    type="button"
                    onClick={() => setShowReset(true)}
                  >
                    Forgot password?
                  </button>
                  <button
                    className="auth-submit-btn"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleLogin}
                  >
                    {isSubmitting ? "Please wait..." : "Login"}
                  </button>
                </div>
              </div>

              <div className={`auth-panel ${mode === "signup" ? "shown" : "hidden"}`}>
                <h3 className="auth-title">Create account</h3>
                <div className="auth-field">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                  />
                </div>
                <div className="auth-actions">
                  <button
                    className="auth-submit-btn"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSignup}
                  >
                    {isSubmitting ? "Creating..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-panel shown">
              <h3 className="auth-title">Reset password</h3>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="auth-actions">
                <button className="link-btn" type="button" onClick={() => setShowReset(false)}>
                  Back to login
                </button>
                <button
                  className="auth-submit-btn"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleReset}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  onClose: PropTypes.func,
  canClose: PropTypes.bool,
};

export default AuthModal;
