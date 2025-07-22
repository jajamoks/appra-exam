import React, { useState } from "react";

const SocialLinksSection: React.FC<any> = ({
  user,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState(user.facebook_url || "");
  const [twitterUrl, setTwitterUrl] = useState(user.twitter_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(user.youtube_url || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        facebook_url: facebookUrl,
        twitter_url: twitterUrl,
        youtube_url: youtubeUrl,
      });
      setIsEditing(false);
    } catch {
      // Error handling is done in parent component
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFacebookUrl(user.facebook_url || "");
    setTwitterUrl(user.twitter_url || "");
    setYoutubeUrl(user.youtube_url || "");
    setIsEditing(false);
  };

  return (
    <div className="section">
      <div className="section-header">
        <h3>Social Media Links</h3>
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
            <label htmlFor="facebook_url">Facebook URL:</label>
            <input
              type="url"
              id="facebook_url"
              value={facebookUrl}
              onChange={e => setFacebookUrl(e.target.value)}
              placeholder="Enter Facebook URL"
            />
          </div>
          <div className="form-group">
            <label htmlFor="twitter_url">X (Twitter) URL:</label>
            <input
              type="url"
              id="twitter_url"
              value={twitterUrl}
              onChange={e => setTwitterUrl(e.target.value)}
              placeholder="Enter X (Twitter) URL"
            />
          </div>
          <div className="form-group">
            <label htmlFor="youtube_url">YouTube URL:</label>
            <input
              type="url"
              id="youtube_url"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL"
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
            <label>Facebook URL:</label>
            <div className="field-value">{user.facebook_url || "Not provided"}</div>
          </div>
          <div className="form-group">
            <label>X (Twitter) URL:</label>
            <div className="field-value">{user.twitter_url || "Not provided"}</div>
          </div>
          <div className="form-group">
            <label>YouTube URL:</label>
            <div className="field-value">{user.youtube_url || "Not provided"}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialLinksSection;
