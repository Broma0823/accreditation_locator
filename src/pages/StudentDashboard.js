import React, { useState } from 'react';
import MapView from '../components/MapView';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1e40af', marginBottom: '10px' }}>Student Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Find and explore accredited boarding houses</p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px'
      }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
          style={{ marginRight: '10px' }}
        >
          Overview
        </button>
        <button
          className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-3">
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Available Rooms</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>42</div>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Vacant rooms in Tagbilaran</p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Dauis Options</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>18</div>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Vacant rooms in Dauis</p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Average Rate</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>₱2,500</div>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Per month</p>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: '20px' }}>
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Featured Boarding Houses</h3>
              <div style={{ space: '10px' }}>
                <div style={{ 
                  padding: '15px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <strong style={{ color: '#1e40af' }}>Sunrise Boarding House</strong><br />
                  <small style={{ color: '#6b7280' }}>Tagbilaran • ₱2,800/month • WiFi, AC</small>
                </div>
                <div style={{ 
                  padding: '15px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <strong style={{ color: '#1e40af' }}>Ocean View Lodge</strong><br />
                  <small style={{ color: '#6b7280' }}>Dauis • ₱2,200/month • Near beach</small>
                </div>
                <div style={{ 
                  padding: '15px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <strong style={{ color: '#1e40af' }}>Mountain Peak Boarding</strong><br />
                  <small style={{ color: '#6b7280' }}>Tagbilaran • ₱2,500/month • Quiet area</small>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Quick Search</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search boarding houses..."
                  className="search-input"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('map')}
                >
                  View Map
                </button>
                <button className="btn btn-secondary">
                  Filter by Price
                </button>
                <button className="btn btn-secondary">
                  Filter by Amenities
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <MapView userRole="student" />
      )}
    </div>
  );
};

export default StudentDashboard;
