import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

const teamData = {
  research: {
    title: "Deep Learning Based Flower Classification Using MobileNetV2",
    conference: "IEEE IATMSI 2026 Conference",
    submissionDate: "2026-01-15",
    status: "Submitted",
    description: "This research presents an efficient flower classification system using MobileNetV2 architecture, achieving 94% accuracy on the TF-Flowers dataset.",
    articleUrl: "https://ieeexplore.ieee.org/document/your-document-number", // Update with actual IEEE article URL
  },
  members: [
    {
      id: 1,
      role: "HOD",
      name: "Dr. JHANSI VAZRAM BOLLA",
      email: "dr.jhansivazrambolla@gmail.com",
      designation: "Professor & Head of Department",
      department: "Information Technology",
      image: "https://i0.wp.com/www.nrtec.in/wp-content/uploads/2023/08/teacher-it.jpg?w=863&ssl=1",
    },
    {
      id: 2,
      role: "Guide",
      name: "UPPALA VIJAY KUMAR",
      email: "cseassistantprofessor@gmail.com",
      designation: "Assist.Professor",
      department: "Information Technology",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3S6K3Yxixk48mIbChlDCHuuGX3CoO06lPd_WHFe3fNHWHoGxfuo6ZpvgobnP4diXxr86PSdihFfyx864Gtvw7YPEw3XLz9dDpxZnl1NojueO-O1J5H1ULMLk_ovY3/s113/photo.jpg",
    },
    {
      id: 3,
      role: "Team Leader",
      name: "SHAIK APPAPURAM FIROZ",
      email: "appapuramfirozforr@gmail.com",
      designation: "Student",
      department: "Information Technology",
      image: "https://avatars.githubusercontent.com/u/157677351?v=4",
    },
    {
      id: 4,
      role: "Team Member",
      name: "THOKA NARENDRA",
      email: "yadavnani39@gmail.com",
      designation: "Student",
      department: "Information Technology",
      image: "https://image2url.com/images/1765511650959-b81653c0-acbf-4b75-aa4b-6a035f8f7788.jpg",
    },
    {
      id: 5,
      role: "Team Member",
      name: "SEELAM SASIDHAR",
      email: "seelamsasi426@gmail.com",
      designation: "Student",
      department: "Information Technology",
      image: "https://image2url.com/images/1765511859320-947abf77-c67d-4a47-8f85-48d438696abc.jpg",
    },
    {
      id: 6,
      role: "Team Member",
      name: "SHAIK KUNDURTHI KHASIM",
      email: "sk5696950@gmail.com",
      designation: "Student",
      department: "Information Technology",
      image: "https://image2url.com/images/1765511977114-6b09b7ed-0390-4a81-aec5-a283aae349d6.jpg",
    },
  ],
};

function TeamAssociates({ onClose }) {
  const [tab, setTab] = useState("team");
  const [filter, setFilter] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);
  const filteredMembers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return teamData.members;
    return teamData.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
    );
  }, [filter]);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      try {
        emailjs.init(publicKey);
      } catch {
      }
    }
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      toast.error("Please fill in all fields");
      return;
    }
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      toast.error("Email service not configured");
      return;
    }
    setSending(true);
    try {
      await emailjs.send(serviceId, templateId, {
        from_name: contactName,
        from_email: contactEmail,
        reply_to: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      });
      toast.success("Message sent");
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (err) {
      const msg = err?.text || err?.message || "Failed to send message";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Team Associates & Research</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button className={`tab-btn ${tab === "team" ? "active" : ""}`} onClick={() => setTab("team")}>
              Team
            </button>
            <button className={`tab-btn ${tab === "research" ? "active" : ""}`} onClick={() => setTab("research")}>
              Research
            </button>
            <button className={`tab-btn ${tab === "project" ? "active" : ""}`} onClick={() => setTab("project")}>
              Project Info
            </button>
            <button className={`tab-btn ${tab === "dataset" ? "active" : ""}`} onClick={() => setTab("dataset")}>
              Dataset
            </button>
            <div className="tab-underline" data-active={tab} />
          </div>

          {tab === "dataset" ? (
            <section className="research-section">
              <div className="section-header">
                <h3>TF-Flowers Dataset</h3>
              </div>
              <div className="research-card">
                <h4>Overview</h4>
                <p>Dataset of five flower classes: Daisy, Dandelion, Roses, Sunflowers, Tulips.</p>
                <p>Used for training and inference in PetalNetV2.</p>
                <div className="research-actions">
                  <a
                    href="https://tensorflow.org/datasets/catalog/tf_flowers"
                    target="_blank"
                    rel="noreferrer"
                    className="view-article-btn"
                  >
                    View Dataset
                  </a>
                </div>
              </div>
            </section>
          ) : tab === "project" ? (
            <section className="project-section">
              <div className="section-header">
                <h3>Project Information</h3>
              </div>
              <div className="research-card">
                <h4>Models Used</h4>
                <p>MobileNetV2 as the backbone CNN, initialized with ImageNet weights and fine-tuned on TF-Flowers. Final dense head uses softmax over 5 classes with label smoothing to improve calibration.</p>
                <p>Optional variant: a fine-tuned checkpoint (`model_finetuned.keras`) with extended training and lower learning rates for the top layers.</p>
                <h4>Dataset Used</h4>
                <p>TF-Flowers dataset with five classes: Daisy, Dandelion, Roses, Sunflowers, Tulips. Images are diverse in lighting and background. Dataset split into train/validation/test with stratification to preserve class balance.</p>
                <p>Input constraints in the UI guide users to upload images corresponding to these classes to maintain reliable inference.</p>
                <h4>Data Pipeline & Preprocessing</h4>
                <p>Images are resized to 224×224, converted to RGB, and normalized via MobileNetV2 preprocessing. Augmentations include random rotations, flips, zooms, translations, brightness/contrast adjustments for robustness.</p>
                <h4>Training Regimen</h4>
                <p>Two-phase training: freeze the base model and train the head, then unfreeze top MobileNetV2 blocks and fine-tune with a lower learning rate and cosine decay. Early stopping and checkpointing prevent overfitting.</p>
                <h4>Evaluation & Metrics</h4>
                <p>Accuracy and F1-score monitored per class, with confusion matrix to inspect misclassifications. Calibration assessed via confidence histograms; improvements applied through label smoothing and balanced sampling.</p>
                <h4>System Architecture</h4>
                <p>Frontend (React + Vite) handles image input, preview, auth, and animated results. Backend (FastAPI) preloads TensorFlow model and serves `/predict` with multipart file handling. Axios client communicates over REST with CORS enabled.</p>
                <h4>Security & Configuration</h4>
                <p>Firebase Auth restricts usage to authenticated users. Secrets are injected via environment variables for deployment. No credentials are logged; network calls are limited to required endpoints.</p>
                <h4>Technical Stack</h4>
                <p>Frontend: React 18, Vite, React-Toastify, Recharts for UI/feedback/visualization. Backend: FastAPI, TensorFlow, NumPy, PIL. Auth: Firebase Web SDK. Build tooling: ESLint, Vite.</p>
                <h4>Tools & Deployment</h4>
                <p>Frontend deployable on Vercel; backend on Render/Railway with `uvicorn` and configured `PORT`. Artifacts bundled with model weights placed under `backend/model/`.</p>
                <h4>Future Improvements</h4>
                <p>Add Grad-CAM visualizations, on-device model quantization for WebGPU/WebAssembly, advanced error analysis dashboards, and active learning loop to collect hard examples.</p>
              </div>
            </section>
          ) : tab === "research" ? (
            <section className="research-section">
              <div className="section-header">
                <h3>Research Article</h3>
              </div>
              <div className="research-card">
                <h4>{teamData.research.title}</h4>
                <p><strong>Conference:</strong> {teamData.research.conference}</p>
                <p><strong>Submission Date:</strong> {teamData.research.submissionDate}</p>
                <p><strong>Status:</strong> {teamData.research.status}</p>
                <p>{teamData.research.description}</p>
                <div className="research-actions">
                  <a 
                    href={teamData.research.articleUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="view-article-btn"
                  >
                    View Article
                  </a>
                </div>
              </div>
              <div className="contact-section">
                <h3>Contact</h3>
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        className="form-input"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        className="form-input"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      className="form-input"
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Subject"
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      className="form-textarea"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message"
                    />
                  </div>
                  <button className="submit-btn" type="submit" disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </section>
          ) : (
            <section className="team-section">
              <div className="section-header">
                <h3>Team Members</h3>
                <input
                  type="text"
                  className="form-input-small"
                  placeholder="Search by name, role, or dept"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="team-grid">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="team-member-card">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="member-image"
                    />
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p className="member-role">{member.role}</p>
                      <p className="member-designation">{member.designation}</p>
                      <p className="member-dept">{member.department}</p>
                      <p className="member-email">{member.email}</p>
                      <div className="member-actions">
                        <a className="member-btn" href={`mailto:${member.email}`}>Contact</a>
                        <button
                          className="member-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(member.email);
                            toast.success("Email copied to clipboard");
                          }}
                        >
                          Copy Email
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

TeamAssociates.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TeamAssociates;

