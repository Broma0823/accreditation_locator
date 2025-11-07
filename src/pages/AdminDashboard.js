import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AccreditationForm from '../components/AccreditationForm';
import MapView from '../components/MapView';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1e40af', marginBottom: '10px' }}>Admin Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Manage boarding house accreditations and view locations</p>
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
          className={`btn ${activeTab === 'form' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('form')}
          style={{ marginRight: '10px' }}
        >
          Accreditation Form
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
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Total Boarding Houses</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>24</div>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Accredited facilities</p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Pending Reviews</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>7</div>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Awaiting accreditation</p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Students Housed</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>156</div>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Currently accommodated</p>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: '20px' }}>
            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Recent Activities</h3>
              <div style={{ space: '10px' }}>
                <div style={{ 
                  padding: '10px', 
                  borderLeft: '4px solid #059669', 
                  marginBottom: '10px',
                  backgroundColor: '#f0fdf4'
                }}>
                  <strong>New accreditation approved</strong><br />
                  <small style={{ color: '#6b7280' }}>Sunrise Boarding House - Tagbilaran</small>
                </div>
                <div style={{ 
                  padding: '10px', 
                  borderLeft: '4px solid #d97706', 
                  marginBottom: '10px',
                  backgroundColor: '#fffbeb'
                }}>
                  <strong>Review scheduled</strong><br />
                  <small style={{ color: '#6b7280' }}>Ocean View Lodge - Dauis</small>
                </div>
                <div style={{ 
                  padding: '10px', 
                  borderLeft: '4px solid #7c3aed', 
                  marginBottom: '10px',
                  backgroundColor: '#faf5ff'
                }}>
                  <strong>Student complaint resolved</strong><br />
                  <small style={{ color: '#6b7280' }}>Mountain Peak Boarding - Tagbilaran</small>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('form')}
                >
                  New Accreditation Form
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('map')}
                >
                  View Map
                </button>
                <button className="btn btn-success">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'form' && (
        <AccreditationForm />
      )}

      {activeTab === 'map' && (
        <MapView userRole="admin" />
      )}
    </div>
  );
};

export default AdminDashboard;
