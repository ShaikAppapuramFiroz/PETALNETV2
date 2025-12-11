import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";

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
      email: "sarah.johnson@university.edu",
      designation: "Professor & Head of Department",
      department: "Information Technology",
      image: "https://i0.wp.com/www.nrtec.in/wp-content/uploads/2023/08/teacher-it.jpg?w=863&ssl=1",
    },
    {
      id: 2,
      role: "Guide",
      name: "UPPALA VIJAY KUMAR",
      email: "john.smith@university.edu",
      designation: "Assist.Professor",
      department: "Information Technology",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3S6K3Yxixk48mIbChlDCHuuGX3CoO06lPd_WHFe3fNHWHoGxfuo6ZpvgobnP4diXxr86PSdihFfyx864Gtvw7YPEw3XLz9dDpxZnl1NojueO-O1J5H1ULMLk_ovY3/s113/photo.jpg",
    },
    {
      id: 3,
      role: "Team Leader",
      name: "SHAIK APPAPURAM FIROZ",
      email: "alex.williams@university.edu",
      designation: "Student",
      department: "Information Technology",
      image: "https://img.sanishtech.com/u/292da22f1eaae64e3339e3aa25dea882.jpg",
    },
    {
      id: 4,
      role: "Team Member",
      name: "THOKA NARENDRA",
      email: "emily.brown@university.edu",
      designation: "Student",
      department: "Information Technology",
      image: "https://img.sanishtech.com/u/e232e0f4536da62215418544f784b7fa.jpg",
    },
    {
      id: 5,
      role: "Team Member",
      name: "SEELAM SASIDHAR",
      email: "michael.davis@university.edu",
      designation: "Student",
      department: "Information Technology",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 6,
      role: "Team Member",
      name: "SHAIK KUNDURTHI KHASIM",
      email: "jessica.martinez@university.edu",
      designation: "Student",
      department: "Information Technology",
      image: "https://via.placeholder.com/150",
    },
  ],
};

function TeamAssociates({ onClose }) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(`${apiUrl}/contact`, contactForm);
      
      if (response.data.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
          {/* Research Section */}
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
          </section>

          {/* Team Members Section */}
          <section className="team-section">
            <h3>Team Members</h3>
            <div className="team-grid">
              {teamData.members.map((member) => (
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
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form Section */}
          <section className="contact-section">
            <div className="section-header">
              <h3>Contact Us</h3>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Message subject"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  className="form-textarea"
                  rows="5"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

TeamAssociates.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TeamAssociates;

