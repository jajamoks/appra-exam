import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import AddressSection from "./AddressSection";
import ContactSection from "./ContactSection";
import BankingSection from "./BankingSection";
import SocialLinksSection from "./SocialLinksSection";

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalName, setPersonalName] = useState("");
  const [personalYear, setPersonalYear] = useState("");
  const [personalMonth, setPersonalMonth] = useState("");
  const [personalDay, setPersonalDay] = useState("");
  const [savingPersonal, setSavingPersonal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setPersonalName(userData.name || "");
        
        // Parse date_of_birth into separate components
        if (userData.date_of_birth) {
          const [year, month, day] = userData.date_of_birth.split("-");
          setPersonalYear(year || "");
          setPersonalMonth(month || "");
          setPersonalDay(day || "");
        } else {
          setPersonalYear("");
          setPersonalMonth("");
          setPersonalDay("");
        }
        
        setError(null);
      } catch {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSectionSave = async (sectionData: any) => {
    if (!user) {
      return
    };

    try {
      const updateData = {
        name: user.name,
        email: user.email,
        date_of_birth: user.date_of_birth,
        phone_number: user.phone_number,
        post_address: user.post_address,
        home_address: user.home_address,
        bank_name: user.bank_name,
        bsb: user.bsb,
        account_name: user.account_name,
        account_number: user.account_number,
        facebook_url: user.facebook_url,
        twitter_url: user.twitter_url,
        youtube_url: user.youtube_url,
        ...sectionData,
      };

      const updatedUser = await apiService.updateCurrentUser(updateData);
      setUser(updatedUser);
      setSuccess("Section updated successfully!");
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to update section");
    }
  };

  const handlePersonalSave = async () => {
    setSavingPersonal(true);
    try {
      // Combine year, month, day into date string
      let dateOfBirth = null;
      if (personalYear && personalMonth && personalDay) {
        dateOfBirth = `${personalYear}-${personalMonth.padStart(2, "0")}-${personalDay.padStart(2, "0")}`;
      }
      
      await handleSectionSave({
        name: personalName,
        date_of_birth: dateOfBirth,
      });
      setIsEditingPersonal(false);
    } catch {
      // Error handling is done in parent component
    } finally {
      setSavingPersonal(false);
    }
  };

  const handlePersonalCancel = () => {
    setPersonalName(user?.name || "");
    
    // Reset date components
    if (user?.date_of_birth) {
      const [year, month, day] = user.date_of_birth.split("-");
      setPersonalYear(year || "");
      setPersonalMonth(month || "");
      setPersonalDay(day || "");
    } else {
      setPersonalYear("");
      setPersonalMonth("");
      setPersonalDay("");
    }
    
    setIsEditingPersonal(false);
  };

  // Generate year options (current year down to 100 years ago)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  // Generate month options
  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate day options
  const generateDayOptions = () => {
    const days = [];
    for (let day = 1; day <= 31; day++) {
      days.push(day);
    }
    return days;
  };


  if (loading) {
    return <div className="loading">Loading user profile...</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="user-profile">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="section">
        <div className="section-header">
          <h3>Personal Information</h3>
          {!isEditingPersonal && (
            <button
              className="btn btn-secondary"
              onClick={() => setIsEditingPersonal(true)}
            >
              Edit
            </button>
          )}
        </div>

        {isEditingPersonal ? (
          <>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={personalName}
                onChange={e => setPersonalName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <div className="date-dropdowns">
                <select
                  value={personalYear}
                  onChange={e => setPersonalYear(e.target.value)}
                  className="date-select"
                >
                  <option value="">Year</option>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={personalMonth}
                  onChange={e => setPersonalMonth(e.target.value)}
                  className="date-select"
                >
                  <option value="">Month</option>
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={personalDay}
                  onChange={e => setPersonalDay(e.target.value)}
                  className="date-select"
                >
                  <option value="">Day</option>
                  {generateDayOptions().map(day => (
                    <option key={day} value={day.toString().padStart(2, "0")}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handlePersonalSave}
                disabled={savingPersonal}
              >
                {savingPersonal ? "Saving..." : "Save"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handlePersonalCancel}
                disabled={savingPersonal}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Name:</label>
              <div className="field-value">{user.name || "Not provided"}</div>
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <div className="field-value">{user.date_of_birth || "Not provided"}</div>
            </div>
          </>
        )}
      </div>

      <ContactSection user={user} onSave={handleSectionSave} />
      <AddressSection user={user} onSave={handleSectionSave} />
      <BankingSection user={user} onSave={handleSectionSave} />
      <SocialLinksSection user={user} onSave={handleSectionSave} />
    </div>
  );
};

export default UserProfile;
