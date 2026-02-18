import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/settings';

const Landing: React.FC = () => {
  const { isLoading, error, loadSettings, getThemeColor, getCallsign, getCouplename, getAppName, getCoupleOfficialDate, getStartingGreetings } = useSettingsStore();
  const [displayData, setDisplayData] = useState<{
    themeColor: string;
    callsign: string;
    couplename: string;
    appName: string;
    coupleOfficialDate: string;
    startingGreetings: string;
  } | null>(null);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        await loadSettings();
        // Once loaded, get all the values
        const themeColor = getThemeColor();
        const callsign = getCallsign();
        const couplename = getCouplename();
        const appName = getAppName();
        const coupleOfficialDate = getCoupleOfficialDate();
        const startingGreetings = getStartingGreetings();
        
        setDisplayData({
          themeColor,
          callsign,
          couplename,
          appName,
          coupleOfficialDate,
          startingGreetings
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };

    initializeSettings();
  }, [loadSettings, getThemeColor, getCallsign, getCouplename, getAppName, getCoupleOfficialDate, getStartingGreetings]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading settings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error loading settings</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Initializing...</h2>
      </div>
    );
  }

  // Helper function to format the date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to calculate days together
  const calculateDaysTogether = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysTogether = calculateDaysTogether(displayData.coupleOfficialDate);

  return (
    <div 
      style={{ 
        padding: '40px',
        minHeight: '100vh',
        backgroundColor: displayData.themeColor + '20', // Adding transparency
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div 
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: `3px solid ${displayData.themeColor}`
        }}
      >
        <h1 
          style={{ 
            color: displayData.themeColor,
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '2.5rem'
          }}
        >
          💌 {displayData.appName} 💌
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            Welcome to your personalized love space!
          </h2>
          
          <div 
            style={{
              backgroundColor: displayData.themeColor + '15',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}
          >
            <h3 style={{ color: displayData.themeColor, marginBottom: '15px' }}>
              Your Settings:
            </h3>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              <p><strong>📱 App Name:</strong> {displayData.appName}</p>
              <p><strong>👤 Callsign:</strong> {displayData.callsign}</p>
              <p><strong>💕 Couple Name:</strong> {displayData.couplename}</p>
              <p><strong>📅 Official Date:</strong> {formatDate(displayData.coupleOfficialDate)}</p>
              <p><strong>💝 Starting Greetings:</strong> {displayData.startingGreetings}</p>
              <p><strong>🎨 Theme Color:</strong> 
                <span 
                  style={{ 
                    backgroundColor: displayData.themeColor,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginLeft: '8px'
                  }}
                >
                  {displayData.themeColor}
                </span>
              </p>
            </div>
          </div>

          <div 
            style={{
              fontSize: '1.2rem',
              color: '#666',
              fontStyle: 'italic',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '10px',
              borderLeft: `4px solid ${displayData.themeColor}`
            }}
          >
            "Hello {displayData.startingGreetings}! This is your personalized space for {displayData.couplename}. 
            You've been together for {daysTogether} days since {formatDate(displayData.coupleOfficialDate)}. 
            Your future love letters will be styled with your chosen theme color."
          </div>

          <div 
            style={{
              backgroundColor: displayData.themeColor + '10',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px',
              fontSize: '1rem',
              color: '#555'
            }}
          >
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>💕 Relationship Stats:</p>
            <p style={{ margin: '0' }}>
              {daysTogether} days of love and counting! 
              Started on {formatDate(displayData.coupleOfficialDate)} ✨
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            style={{
              backgroundColor: displayData.themeColor,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1.1rem',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✨ Create Your Love Letter ✨
          </button>
        </div>

        <div 
          style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: displayData.themeColor + '10',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#666'
          }}
        >
          <strong>Settings Demo:</strong> This component demonstrates how to use the settings store 
          with app name "{displayData.appName}", callsign "{displayData.callsign}", 
          couplename "{displayData.couplename}", official date "{displayData.coupleOfficialDate}", 
          starting greetings "{displayData.startingGreetings}", and theme color "{displayData.themeColor}".
        </div>
      </div>
    </div>
  );
};

export default Landing;
