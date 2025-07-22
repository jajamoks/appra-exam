import React, { useState } from "react";
import SensitiveDataSection from "./SensitiveDataSection";

const BankingSection: React.FC<any> = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bankName, setBankName] = useState(user.bank_name || "");
  const [bsb, setBsb] = useState(user.bsb || "");
  const [accountName, setAccountName] = useState(user.account_name || "");
  const [accountNumber, setAccountNumber] = useState(user.account_number || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        bank_name: bankName,
        bsb,
        account_name: accountName,
        account_number: accountNumber,
      });
      setIsEditing(false);
    } catch {
      // Error handling is done in parent component
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBankName(user.bank_name || "");
    setBsb(user.bsb || "");
    setAccountName(user.account_name || "");
    setAccountNumber(user.account_number || "");
    setIsEditing(false);
  };

  return (
    <SensitiveDataSection title="Banking Information">
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
                <label htmlFor="bank_name">Bank Name:</label>
                <input
                  type="text"
                  id="bank_name"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bsb">BSB:</label>
                <input
                  type="text"
                  id="bsb"
                  value={bsb}
                  onChange={e => setBsb(e.target.value)}
                  placeholder="Enter BSB"
                />
              </div>
              <div className="form-group">
                <label htmlFor="account_name">Account Name:</label>
                <input
                  type="text"
                  id="account_name"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="Enter account name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="account_number">Account Number:</label>
                <input
                  type="text"
                  id="account_number"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
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
                <label>Bank Name:</label>
                <div className="field-value">
                  {user.bank_name || "Not provided"}
                </div>
              </div>
              <div className="form-group">
                <label>BSB:</label>
                <div className="field-value">{user.bsb || "Not provided"}</div>
              </div>
              <div className="form-group">
                <label>Account Name:</label>
                <div className="field-value">
                  {user.account_name || "Not provided"}
                </div>
              </div>
              <div className="form-group">
                <label>Account Number:</label>
                <div className="field-value">
                  {user.account_number || "Not provided"}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </SensitiveDataSection>
  );
};

export default BankingSection;
