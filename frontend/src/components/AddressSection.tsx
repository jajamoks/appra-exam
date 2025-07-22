import React, { useState } from "react";


const AddressSection: React.FC<any> = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [postAddress, setPostAddress] = useState(user.post_address || "");
  const [homeAddress, setHomeAddress] = useState(user.home_address || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        post_address: postAddress,
        home_address: homeAddress,
      });
      setIsEditing(false);
    } catch {
      // Error handling is done in parent component
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPostAddress(user.post_address || "");
    setHomeAddress(user.home_address || "");
    setIsEditing(false);
  };

  return (
    <div className="section">
      <div className="section-header">
        <h3>Address Information</h3>
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
            <label htmlFor="post_address">Post Address:</label>
            <input
              type="text"
              id="post_address"
              value={postAddress}
              onChange={e => setPostAddress(e.target.value)}
              placeholder="Enter post address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="home_address">Home Address:</label>
            <input
              type="text"
              id="home_address"
              value={homeAddress}
              onChange={e => setHomeAddress(e.target.value)}
              placeholder="Enter home address"
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
            <label>Post Address:</label>
            <div className="field-value">{user.post_address || "Not provided"}</div>
          </div>
          <div className="form-group">
            <label>Home Address:</label>
            <div className="field-value">{user.home_address || "Not provided"}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddressSection;
