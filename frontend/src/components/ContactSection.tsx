import React, { useState } from "react";
import SensitiveDataSection from "./SensitiveDataSection";
const ContactSection: React.FC<any> = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        email,
        phone_number: phoneNumber,
      });
      setIsEditing(false);
    } catch {
      // Error handling is done in parent component
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEmail(user.email || "");
    setPhoneNumber(user.phone_number || "");
    setIsEditing(false);
  };

  return (
    <SensitiveDataSection title="Contact Information">
      {unlockedTitle => (
        <div className="section">
          <div className="section-header">
            <h3>{unlockedTitle}</h3>
            {!isEditing && (
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number:</label>
                <input
                  type="tel"
                  id="phone_number"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="button-group">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Email:</label>
                <div className="field-value">
                  {user.email || "Not provided"}
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <div className="field-value">
                  {user.phone_number || "Not provided"}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </SensitiveDataSection>
  );
};

export default ContactSection;
