import { useEffect, useMemo, useRef, useState } from "react";
import TeamAssociates from "./TeamAssociates";
import AuthModal from "./AuthModal";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { onAuthStateChanged, signOut, sendPasswordResetEmail, updateProfile } from "firebase/auth";

function Navbar() {
  const [showTeam, setShowTeam] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setShowProfileDetails(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initials = useMemo(() => {
    if (!user?.displayName) return "";
    return user.displayName
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 3)
      .join("");
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setShowProfileMenu(false);
    setShowProfileDetails(false);
  };

  const openProfile = () => {
    setEditingName(user?.displayName || "");
    setShowProfileDetails(true);
  };

  const saveDisplayName = async () => {
    if (!editingName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editingName.trim() });
      toast.success("Display name updated");
      setShowProfileDetails(false);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Password reset email sent");
      setShowProfileMenu(false);
      setShowProfileDetails(false);
    } catch (e) {
      toast.error(e.message || "Could not send reset email");
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">PetalNetV2</div>
        <nav>
          {!user ? (
            <button className="nav-link-btn" onClick={() => setShowAuth(true)}>
              Login
            </button>
          ) : (
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="avatar-btn"
                onClick={() => setShowProfileMenu((v) => !v)}
                aria-label="Profile menu"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-initials" aria-hidden>{initials || "U"}</div>
                )}
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown" role="menu">
                  {!showProfileDetails ? (
                    <>
                      <div className="profile-header">
                        <div className="profile-avatar">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="avatar-img" />
                          ) : (
                            <div className="avatar-initials small">{initials || "U"}</div>
                          )}
                        </div>
                        <div className="profile-info">
                          <div className="profile-name">{user.displayName || "User"}</div>
                          <div className="profile-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="dropdown-separator" />
                      <button className="dropdown-item" type="button" onClick={openProfile}>
                        Profile
                      </button>
                      <button className="dropdown-item" type="button" onClick={resetPassword}>
                        Reset Password
                      </button>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowTeam(true);
                        }}
                      >
                        About Us
                      </button>
                      <div className="dropdown-separator" />
                      <button className="dropdown-item danger" type="button" onClick={handleLogout}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="profile-details">
                      <div className="profile-row">
                        <div className="profile-label">Name</div>
                        <input
                          className="form-input-small"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Display name"
                        />
                      </div>
                      <div className="profile-row">
                        <div className="profile-label">Email</div>
                        <div className="profile-value">{user.email}</div>
                      </div>
                      <div className="dropdown-separator" />
                      <div className="profile-actions">
                        <button className="dropdown-item" type="button" onClick={resetPassword}>
                          Reset Password
                        </button>
                        <button
                          className="dropdown-item"
                          type="button"
                          disabled={saving || !editingName.trim()}
                          onClick={saveDisplayName}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="dropdown-item danger"
                          type="button"
                          onClick={() => setShowProfileDetails(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
      {showTeam && <TeamAssociates onClose={() => setShowTeam(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default Navbar;
