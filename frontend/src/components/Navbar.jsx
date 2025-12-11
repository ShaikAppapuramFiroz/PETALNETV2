import { useState } from "react";
import TeamAssociates from "./TeamAssociates";

function Navbar() {
  const [showTeam, setShowTeam] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="logo">PetalNetV2</div>
        <nav>
          <a 
            href={import.meta.env.VITE_GITHUB_REPO || "https://github.com/yourusername/PETALNETV2"} 
            target="_blank" 
            rel="noreferrer"
            title="View source code on GitHub"
          >
            Source Code
          </a>
          <a href="https://tensorflow.org/datasets/catalog/tf_flowers" target="_blank" rel="noreferrer">
            Dataset
          </a>
          <button className="nav-link-btn" onClick={() => setShowTeam(true)}>
            About Us
          </button>
        </nav>
      </header>
      {showTeam && <TeamAssociates onClose={() => setShowTeam(false)} />}
    </>
  );
}

export default Navbar;

