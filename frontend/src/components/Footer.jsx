function Footer() {
  const currentYear = new Date().getFullYear();
  const githubRepo = import.meta.env.VITE_GITHUB_REPO || "https://github.com/yourusername/PETALNETV2";

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>PetalNetV2</h4>
          <p>Advanced flower classification using MobileNetV2 deep learning model.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href={githubRepo} target="_blank" rel="noreferrer">
                Source Code
              </a>
            </li>
            <li>
              <a href="https://tensorflow.org/datasets/catalog/tf_flowers" target="_blank" rel="noreferrer">
                Dataset
              </a>
            </li>
            <li>
              <a href="https://ieeexplore.ieee.org/document/your-document-number" target="_blank" rel="noreferrer">
                Research Paper
              </a>
            </li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Flower Classes</h4>
          <ul>
            <li>Daisy</li>
            <li>Dandelion</li>
            <li>Roses</li>
            <li>Sunflowers</li>
            <li>Tulips</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: appapuramfirozforr@gmail.com</p>
          <p>Conference: IEEE IATMSI 2026</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          © {currentYear} PetalNetV2. All rights reserved. • Built with MobileNetV2
        </p>
        <p className="muted">
          Published in IEEE IATMSI 2026 Conference
        </p>
      </div>
    </footer>
  );
}

export default Footer;

