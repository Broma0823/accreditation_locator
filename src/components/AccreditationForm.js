import React, { useState } from 'react';

const CRITERIA_SECTIONS = [
  {
    key: 'facility',
    label: 'Facility',
    items: [
      { key: 'roomSize', label: 'Room Size' },
      { key: 'ventilation', label: 'Ventilation' },
      { key: 'buildingComponent', label: 'Building Component' },
      { key: 'hallway', label: 'Hallway' },
      { key: 'kitchen', label: 'Kitchen' },
      { key: 'diningArea', label: 'Dining Area' },
      { key: 'bathroomFacilities', label: 'Bathroom Facilities' },
      { key: 'comfortRoom', label: 'Comfort Room' },
      { key: 'visitorsArea', label: "Visitor's Area" }
    ]
  },
  {
    key: 'safety',
    label: 'Safety',
    items: [
      { key: 'fireSafety', label: 'Fire safety' },
      { key: 'electricalInstallation', label: 'Electrical Installation' },
      { key: 'firstAidKit', label: 'First Aid Kit' },
      { key: 'sanitation', label: 'Sanitation' }
    ]
  },
  {
    key: 'security',
    label: 'Security',
    items: [
      { key: 'locksDoorsWindows', label: 'Functional locks on doors and windows' },
      { key: 'adequateLighting', label: 'Adequate lighting in common areas and outdoor spaces' },
      { key: 'securityPresence', label: 'Presence of any security issue' }
    ]
  },
  {
    key: 'rate',
    label: 'Rate',
    items: [
      { key: 'roomRate', label: 'Room rate' },
      { key: 'additionalCharges', label: 'Additional charges' }
    ]
  }
];

const AMENITIES = [
  { key: 'surveillanceCamera', label: 'Surveillance camera' },
  { key: 'wifi', label: 'Wifi' },
  { key: 'airConditioning', label: 'Airconditioning unit' },
  { key: 'potableWater', label: 'Potable water dispenser' }
];

const createInitialEvaluationCriteria = () => {
  const criteria = {};
  CRITERIA_SECTIONS.forEach(section => {
    criteria[section.key] = section.items.reduce((acc, item) => {
      acc[item.key] = { status: '', alternative: '' };
      return acc;
    }, {});
  });
  return criteria;
};

const createInitialAmenities = () => {
  return AMENITIES.reduce((acc, amenity) => {
    acc[amenity.key] = false;
    return acc;
  }, {});
};

const AccreditationForm = () => {
  const [formData, setFormData] = useState({
    // General Information
    boardingHouseName: '',
    address: '',
    ownerName: '',
    landlordName: '',
    managerVisitSchedule: '',
    hasOfficers: '',
    businessPermit: '',
    fireClearance: '',
    
    // Environmental Sanitation
    houseType: [],
    waterSupply: [],
    waterStorage: [],
    toiletType: '',
    hasGarbageBins: '',
    garbageDisposal: [],
    hasLeisureFacilities: '',
    
    // Household Status
    totalRooms: '',
    maleRooms: '',
    femaleRooms: '',
    totalBoarders: '',
    maleBoarders: '',
    femaleBoarders: '',
    occupantsPerRoom: '',
    totalComfortRooms: '',
    maleComfortRooms: '',
    femaleComfortRooms: '',
    hasOrganization: '',
    meetingFrequency: '',
    hasSocialActivities: '',
    
    // Health
    medicalAttendant: '',
    seeksMedicalHelp: '',
    medicalLocation: [],
    
    // Safety/Security
    hasGateFence: '',
    hasFireExtinguisher: '',
    hasLogbook: '',
    hasVisitorLogbook: '',
    hasCurfew: '',
    curfewTime: '',
    visitingHours: '',
    hasHeadcount: '',
    hasHouseRules: '',
    rulesDiscussed: '',
    disciplinaryActions: '',
    commonProblems: '',

    // Evaluation criteria & amenities
    evaluationStatus: '',
    evaluationCriteria: createInitialEvaluationCriteria(),
    otherAmenities: createInitialAmenities()
  });

  const [imageFile, setImageFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCriteriaStatusChange = (sectionKey, itemKey, status) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: {
        ...prev.evaluationCriteria,
        [sectionKey]: {
          ...prev.evaluationCriteria[sectionKey],
          [itemKey]: {
            ...prev.evaluationCriteria[sectionKey][itemKey],
            status,
            alternative: status === 'not_acceptable'
              ? prev.evaluationCriteria[sectionKey][itemKey].alternative
              : ''
          }
        }
      }
    }));
  };

  const handleCriteriaAlternativeChange = (sectionKey, itemKey, alternative) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: {
        ...prev.evaluationCriteria,
        [sectionKey]: {
          ...prev.evaluationCriteria[sectionKey],
          [itemKey]: {
            ...prev.evaluationCriteria[sectionKey][itemKey],
            alternative
          }
        }
      }
    }));
  };

  const handleAmenityToggle = (amenityKey) => {
    setFormData(prev => ({
      ...prev,
      otherAmenities: {
        ...prev.otherAmenities,
        [amenityKey]: !prev.otherAmenities[amenityKey]
      }
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setPrediction(null);
    setPredictionError('');
  };

  const handlePredict = async () => {
    if (!imageFile) {
      setPredictionError('Please select an image before requesting a prediction.');
      return;
    }

    try {
      setIsPredicting(true);
      setPredictionError('');
      const payload = new FormData();
      payload.append('image', imageFile);

      const response = await fetch('http://localhost:4000/api/predict', {
        method: 'POST',
        body: payload
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Prediction failed' }));
        throw new Error(error.error || 'Prediction failed');
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setPrediction(null);
      setPredictionError(err.message || 'Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted successfully! (This is a demo)');
    console.log('Form Data:', formData);
    console.log('Prediction:', prediction);
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '10px' }}>Boarding House Accreditation Form</h2>
        <p style={{ color: '#6b7280' }}>Republic of the Philippines • Bohol Island State University</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Information */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            General Information
          </h3>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name of Boarding House:</label>
              <input
                type="text"
                name="boardingHouseName"
                value={formData.boardingHouseName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter boarding house name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Address:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name of Owner:</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter owner name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Name of Landlord/Landlady/Manager:</label>
              <input
                type="text"
                name="landlordName"
                value={formData.landlordName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter landlord/manager name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Schedule of visit of the manager/owner:</label>
            <input
              type="text"
              name="managerVisitSchedule"
              value={formData.managerVisitSchedule}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Monday-Friday, 8AM-5PM"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Do you have officers mobilized as in charge or assigned as leader among boarders?</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="hasOfficers"
                  value="yes"
                  checked={formData.hasOfficers === 'yes'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="hasOfficers"
                  value="no"
                  checked={formData.hasOfficers === 'no'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Business Permit:</label>
              <input
                type="text"
                name="businessPermit"
                value={formData.businessPermit}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter permit number"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Fire Clearance:</label>
              <input
                type="text"
                name="fireClearance"
                value={formData.fireClearance}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter clearance number"
              />
            </div>
          </div>
        </div>

        {/* Environmental Sanitation */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Environmental Sanitation
          </h3>

          <div className="form-group">
            <label className="form-label">House Type:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['Concrete', 'Semi concrete', 'Single storey', 'Two storey'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    name="houseType"
                    value={type.toLowerCase().replace(' ', '_')}
                    checked={formData.houseType.includes(type.toLowerCase().replace(' ', '_'))}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Water Supply:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['Pipe water', 'Rain', 'Artisan well', 'Nawasa'].map(supply => (
                <label key={supply} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    name="waterSupply"
                    value={supply.toLowerCase().replace(' ', '_')}
                    checked={formData.waterSupply.includes(supply.toLowerCase().replace(' ', '_'))}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  {supply}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Water Storage:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['Galvanized water tank', 'Plastic water tank', 'Water containers'].map(storage => (
                <label key={storage} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    name="waterStorage"
                    value={storage.toLowerCase().replace(' ', '_')}
                    checked={formData.waterStorage.includes(storage.toLowerCase().replace(' ', '_'))}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  {storage}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Toilet Type:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="toiletType"
                  value="water_sealed"
                  checked={formData.toiletType === 'water_sealed'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Water sealed
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="toiletType"
                  value="other"
                  checked={formData.toiletType === 'other'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Other (specify)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Presence of Garbage Bins:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="hasGarbageBins"
                  value="yes"
                  checked={formData.hasGarbageBins === 'yes'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="hasGarbageBins"
                  value="no"
                  checked={formData.hasGarbageBins === 'no'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Garbage Disposal:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['Burning', 'Garbage truck', 'Compost pit'].map(method => (
                <label key={method} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    name="garbageDisposal"
                    value={method.toLowerCase().replace(' ', '_')}
                    checked={formData.garbageDisposal.includes(method.toLowerCase().replace(' ', '_'))}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Household Status */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Household Status
          </h3>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Total number of rooms:</label>
              <input
                type="number"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of rooms for male:</label>
              <input
                type="number"
                name="maleRooms"
                value={formData.maleRooms}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of rooms for female:</label>
              <input
                type="number"
                name="femaleRooms"
                value={formData.femaleRooms}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Total number of boarders:</label>
              <input
                type="number"
                name="totalBoarders"
                value={formData.totalBoarders}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of male boarders:</label>
              <input
                type="number"
                name="maleBoarders"
                value={formData.maleBoarders}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of female boarders:</label>
              <input
                type="number"
                name="femaleBoarders"
                value={formData.femaleBoarders}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Number of occupants per room:</label>
              <input
                type="number"
                name="occupantsPerRoom"
                value={formData.occupantsPerRoom}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Total number of comfort rooms:</label>
              <input
                type="number"
                name="totalComfortRooms"
                value={formData.totalComfortRooms}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of male comfort rooms:</label>
              <input
                type="number"
                name="maleComfortRooms"
                value={formData.maleComfortRooms}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Number of female comfort rooms:</label>
              <input
                type="number"
                name="femaleComfortRooms"
                value={formData.femaleComfortRooms}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Do you have organization among boarders?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasOrganization"
                    value="yes"
                    checked={formData.hasOrganization === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasOrganization"
                    value="no"
                    checked={formData.hasOrganization === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Safety/Security */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Safety/Security
          </h3>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Presence of gate & fence?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasGateFence"
                    value="yes"
                    checked={formData.hasGateFence === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasGateFence"
                    value="no"
                    checked={formData.hasGateFence === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Do you have fire extinguisher?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasFireExtinguisher"
                    value="yes"
                    checked={formData.hasFireExtinguisher === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasFireExtinguisher"
                    value="no"
                    checked={formData.hasFireExtinguisher === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Presence of 'whereabouts' logbook?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasLogbook"
                    value="yes"
                    checked={formData.hasLogbook === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasLogbook"
                    value="no"
                    checked={formData.hasLogbook === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Visitor's logbook?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasVisitorLogbook"
                    value="yes"
                    checked={formData.hasVisitorLogbook === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasVisitorLogbook"
                    value="no"
                    checked={formData.hasVisitorLogbook === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Do you have curfew time?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasCurfew"
                    value="yes"
                    checked={formData.hasCurfew === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasCurfew"
                    value="no"
                    checked={formData.hasCurfew === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">What is the curfew time?</label>
              <input
                type="text"
                name="curfewTime"
                value={formData.curfewTime}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 10:00 PM"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">What is the Visiting day and time?</label>
            <input
              type="text"
              name="visitingHours"
              value={formData.visitingHours}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Saturday-Sunday, 8AM-8PM"
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Do you have headcount every day/night?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasHeadcount"
                    value="yes"
                    checked={formData.hasHeadcount === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasHeadcount"
                    value="no"
                    checked={formData.hasHeadcount === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Do you have house rules?</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasHouseRules"
                    value="yes"
                    checked={formData.hasHouseRules === 'yes'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="hasHouseRules"
                    value="no"
                    checked={formData.hasHouseRules === 'no'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Are these clearly discussed to the boarders?</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="rulesDiscussed"
                  value="yes"
                  checked={formData.rulesDiscussed === 'yes'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="rulesDiscussed"
                  value="no"
                  checked={formData.rulesDiscussed === 'no'}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Any form of disciplinary action for any violation of house rules:</label>
            <textarea
              name="disciplinaryActions"
              value={formData.disciplinaryActions}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe disciplinary actions..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">What common problems do you encounter with your boarders?</label>
            <textarea
              name="commonProblems"
              value={formData.commonProblems}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe common problems..."
              rows="3"
            />
          </div>
        </div>

        {/* Image-based Likelihood Prediction */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Predict Accreditation Likelihood from Image
          </h3>

          <div className="form-group">
            <label className="form-label">Upload recent documentation photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePredict}
              disabled={isPredicting}
            >
              {isPredicting ? 'Analyzing...' : 'Predict Likelihood'}
            </button>
            {prediction && (
              <div style={{ color: '#059669', fontWeight: 600 }}>
                Likelihood: {(prediction.likelihood * 100).toFixed(1)}%
                {prediction.label ? ` • ${prediction.label}` : ''}
              </div>
            )}
            {predictionError && (
              <div style={{ color: '#dc2626', fontWeight: 500 }}>{predictionError}</div>
            )}
          </div>

          {prediction?.explanation && (
            <p style={{ marginTop: '12px', color: '#4b5563' }}>{prediction.explanation}</p>
          )}
        </div>

        {/* Evaluation Criteria */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Evaluation Criteria
          </h3>

          {CRITERIA_SECTIONS.map(section => (
            <div key={section.key} style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#1f2937', marginBottom: '12px' }}>{section.label}</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="criteria-table">
                  <thead>
                    <tr>
                      <th>Criteria</th>
                      <th>Acceptable</th>
                      <th>Considerable</th>
                      <th>Not Acceptable</th>
                      <th>Alternative (if not acceptable)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map(item => {
                      const current = formData.evaluationCriteria[section.key][item.key];
                      return (
                        <tr key={item.key}>
                          <td style={{ textAlign: 'left' }}>{item.label}</td>
                          {['acceptable', 'considerable', 'not_acceptable'].map(option => (
                            <td key={option}>
                              <input
                                type="radio"
                                name={`${section.key}-${item.key}`}
                                value={option}
                                checked={current.status === option}
                                onChange={() => handleCriteriaStatusChange(section.key, item.key, option)}
                              />
                            </td>
                          ))}
                          <td>
                            <input
                              type="text"
                              value={current.alternative}
                              onChange={(event) => handleCriteriaAlternativeChange(section.key, item.key, event.target.value)}
                              className="form-input"
                              placeholder="Specify alternative"
                              disabled={current.status !== 'not_acceptable'}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Other available amenities:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {AMENITIES.map(amenity => (
                <label key={amenity.key} style={{ display: 'flex', alignItems: 'center', minWidth: '220px' }}>
                  <input
                    type="checkbox"
                    checked={formData.otherAmenities[amenity.key]}
                    onChange={() => handleAmenityToggle(amenity.key)}
                    className="form-checkbox"
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Result */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Evaluation Result
          </h3>

          <div className="form-group">
            <label className="form-label">Evaluation Status:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="evaluationStatus"
                  value="accredited"
                  checked={formData.evaluationStatus === 'accredited'}
                  style={{ marginRight: '8px' }}
                  onChange={handleInputChange}
                />
                Accredited/Retain Accreditation
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="evaluationStatus"
                  value="conditional"
                  checked={formData.evaluationStatus === 'conditional'}
                  style={{ marginRight: '8px' }}
                  onChange={handleInputChange}
                />
                Conditional
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="evaluationStatus"
                  value="not_accredited"
                  checked={formData.evaluationStatus === 'not_accredited'}
                  style={{ marginRight: '8px' }}
                  onChange={handleInputChange}
                />
                Not Accredited
              </label>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>
            Submit Form
          </button>
          <button type="button" className="btn btn-secondary">
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccreditationForm;
