import React, { useState, useMemo } from 'react';

const CRITERIA_SECTIONS = [
  {
    key: 'facility',
    label: 'Facility',
    items: [
      { 
        key: 'roomSize', 
        label: 'Room Size',
        criteria: {
          acceptable: '≥ 8 m² room size',
          considerable: '4.5–7 m² room size',
          not_acceptable: '< 4.5 m² room size'
        }
      },
      { 
        key: 'ventilation', 
        label: 'Ventilation',
        criteria: {
          acceptable: '≥ 6 windows, ≥ 2 fans',
          considerable: '2-5 windows, 1 fan',
          not_acceptable: '0-1 window, 0 fan/s'
        }
      },
      { 
        key: 'buildingComponent', 
        label: 'Building Component (structure, walls, roof, stairs)',
        criteria: {
          acceptable: 'No visible structural cracks, no leaks, railings solid, doors/windows functioning',
          considerable: 'Minor cracks, peeling paint, small leaks; still safe but needs repair',
          not_acceptable: 'Big cracks, sagging floors/roof, broken railings, exposed wiring, serious leaks'
        }
      },
      { 
        key: 'hallway', 
        label: 'Hallway',
        criteria: {
          acceptable: 'Width ≈ 1.0 m or more, well-lit, no obstacles, clear exit paths',
          considerable: 'Around 0.9–1.0 m, sometimes partially blocked (shoes, bikes, etc.)',
          not_acceptable: 'Too narrow (<0.9 m), dark, often blocked, unsafe in emergency'
        }
      },
      { 
        key: 'kitchen', 
        label: 'Kitchen',
        criteria: {
          acceptable: 'Safe cooking area, proper sink, storage, window + exhaust or hood, clean and not greasy',
          considerable: 'Functional but crowded; weak ventilation; sometimes dirty',
          not_acceptable: 'No proper ventilation, very dirty/greasy, unsafe gas/electrical setup'
        }
      },
      { 
        key: 'diningArea', 
        label: 'Dining Area',
        criteria: {
          acceptable: 'Enough seats/tables for tenants, clean, ventilated, not blocking circulation',
          considerable: 'A bit small or shared with other functions, but still usable',
          not_acceptable: 'No real dining space; people forced to eat in hallways/beds'
        }
      },
      { 
        key: 'bathroomFacilities', 
        label: 'Bathroom Facilities',
        criteria: {
          acceptable: 'Enough toilets/showers for the number of tenants (e.g., 1 CR per 6–8 people). Has water, flushing, drainage, ventilation (window or exhaust), and privacy',
          considerable: 'Works but limited fixtures, queues at peak times, sometimes dirty',
          not_acceptable: 'No water, broken fixtures, no door/locks, strong smell, no ventilation'
        }
      },
      { 
        key: 'comfortRoom', 
        label: 'Comfort Room',
        criteria: {
          acceptable: 'Enough toilets/showers for the number of tenants (e.g., 1 CR per 6–8 people). Has water, flushing, drainage, ventilation (window or exhaust), and privacy',
          considerable: 'Works but limited fixtures, queues at peak times, sometimes dirty',
          not_acceptable: 'No water, broken fixtures, no door/locks, strong smell, no ventilation'
        }
      },
      { 
        key: 'visitorsArea', 
        label: "Visitor's Area",
        criteria: {
          acceptable: 'Clear designated space with seats, decent ventilation, not blocking bedrooms/hallway. Can consider living room as Visitors Area',
          considerable: 'Shared with another space (like dining), but still manageable',
          not_acceptable: 'No proper visitor area; visitors end up in bedrooms or crowded corridors'
        }
      }
    ]
  },
  {
    key: 'safety',
    label: 'Safety',
    items: [
      { 
        key: 'fireSafety', 
        label: 'Fire safety',
        criteria: {
          acceptable: 'Fire extinguishers present and accessible, smoke detectors functional, clear fire exits, fire safety plan posted, regular fire drills conducted',
          considerable: 'Some fire safety equipment present but may be outdated or not easily accessible, fire exits partially blocked, infrequent fire drills',
          not_acceptable: 'No fire extinguishers or smoke detectors, blocked or no fire exits, no fire safety plan, no fire drills, significant fire hazards present'
        }
      },
      { 
        key: 'electricalInstallation', 
        label: 'Electrical Installation',
        criteria: {
          acceptable: 'Proper electrical wiring, adequate outlets with GFCI protection where needed, circuit breakers functional, no exposed wires, proper grounding',
          considerable: 'Electrical system mostly functional but may have some outdated wiring, limited outlets, minor safety concerns, occasional issues',
          not_acceptable: 'Exposed wiring, overloaded circuits, missing circuit breakers, no GFCI protection, frequent electrical problems, fire hazards from electrical system'
        }
      },
      { 
        key: 'firstAidKit', 
        label: 'First Aid Kit',
        criteria: {
          acceptable: 'Complete first aid kit with all essential supplies, easily accessible location, well-maintained and regularly checked, supplies not expired',
          considerable: 'First aid kit present but may be incomplete or missing some supplies, not easily accessible, infrequently checked, some expired items',
          not_acceptable: 'No first aid kit or severely incomplete kit, supplies expired or missing, not accessible, poor maintenance'
        }
      },
      { 
        key: 'sanitation', 
        label: 'Sanitation',
        criteria: {
          acceptable: 'Clean and well-maintained facilities, proper waste disposal system, pest control measures in place, regular cleaning schedule, good hygiene standards',
          considerable: 'Generally clean but may have occasional issues, waste disposal sometimes inadequate, minor pest problems, irregular cleaning',
          not_acceptable: 'Poor cleanliness, inadequate waste disposal, significant pest infestations, no cleaning schedule, unsanitary conditions, health hazards'
        }
      }
    ]
  },
  {
    key: 'security',
    label: 'Security',
    items: [
      { 
        key: 'locksDoorsWindows', 
        label: 'Functional locks on doors and windows',
        criteria: {
          acceptable: 'All doors and windows have functional, secure locks, deadbolts on main entries, locks in good condition, keys properly managed',
          considerable: 'Most doors and windows have locks but some may be damaged or non-functional, basic security measures in place',
          not_acceptable: 'Missing or broken locks on doors/windows, no security measures, easily accessible entry points, security compromised'
        }
      },
      { 
        key: 'adequateLighting', 
        label: 'Adequate lighting in common areas and outdoor spaces',
        criteria: {
          acceptable: 'Well-lit common areas, hallways, and outdoor spaces, adequate lighting for safety, motion sensors or timers, no dark areas',
          considerable: 'Most areas have lighting but some areas may be dim, occasional burned-out bulbs, lighting may be insufficient in some spaces',
          not_acceptable: 'Poor lighting in common areas and outdoor spaces, many dark areas, security risks due to inadequate lighting, frequent lighting failures'
        }
      },
      { 
        key: 'securityPresence', 
        label: 'Presence of any security issue',
        criteria: {
          acceptable: 'Security cameras or guards present, access control systems, incident reporting system, security protocols in place, no recent security incidents',
          considerable: 'Some security measures in place but may be limited, occasional security concerns, basic monitoring',
          not_acceptable: 'No security measures, frequent security incidents, no access control, no monitoring, security vulnerabilities present'
        }
      }
    ]
  },
  {
    key: 'rate',
    label: 'Rate',
    items: [
      { 
        key: 'roomRate', 
        label: 'Room rate',
        criteria: {
          acceptable: 'Fair and competitive room rates, good value for money, rates clearly displayed, reasonable compared to market standards, payment terms clearly defined',
          considerable: 'Room rates are acceptable but may be slightly high or low compared to market, value is moderate, some transparency issues',
          not_acceptable: 'Unfair or excessive room rates, poor value for money, rates not clearly communicated, significantly above market standards, unreasonable pricing'
        }
      },
      { 
        key: 'additionalCharges', 
        label: 'Additional charges',
        criteria: {
          acceptable: 'Transparent additional charges, all fees clearly disclosed, reasonable charges for utilities and services, no hidden fees, fair billing practices',
          considerable: 'Additional charges present but may not be fully transparent, some fees reasonable but others questionable, occasional billing issues',
          not_acceptable: 'Hidden or undisclosed charges, excessive fees, unfair billing practices, charges not justified, billing disputes, lack of transparency'
        }
      }
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

  // Calculate scores and predict accreditation status
  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    const sectionScores = {};
    const criticalItems = ['fireSafety', 'electricalInstallation', 'sanitation', 'locksDoorsWindows'];
    let hasCriticalNotAcceptable = false;

    CRITERIA_SECTIONS.forEach(section => {
      let sectionScore = 0;
      let sectionMax = 0;
      
      section.items.forEach(item => {
        const status = formData.evaluationCriteria[section.key]?.[item.key]?.status || '';
        sectionMax += 2;
        maxScore += 2;
        
        if (status === 'acceptable') {
          sectionScore += 2;
          totalScore += 2;
        } else if (status === 'considerable') {
          sectionScore += 1;
          totalScore += 1;
        } else if (status === 'not_acceptable') {
          if (criticalItems.includes(item.key)) {
            hasCriticalNotAcceptable = true;
          }
        }
      });
      
      sectionScores[section.key] = {
        score: sectionScore,
        max: sectionMax,
        percentage: sectionMax > 0 ? (sectionScore / sectionMax) * 100 : 0
      };
    });

    return {
      totalScore,
      maxScore,
      percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      sectionScores,
      hasCriticalNotAcceptable
    };
  };

  const predictAccreditationStatus = (scores) => {
    const { percentage, hasCriticalNotAcceptable } = scores;

    // Accredited: 70%+ and no critical safety issues
    if (percentage >= 70 && !hasCriticalNotAcceptable) {
      return {
        status: 'accredited',
        label: 'Accredited/Retain Accreditation',
        color: '#059669',
        bgColor: '#f0fdf4',
        description: 'The boarding house meets the required standards for accreditation. All critical safety requirements are met, and overall evaluation score is satisfactory.'
      };
    }
    
    // Not Accredited: Below 50% OR has critical safety issues
    if (percentage < 50 || hasCriticalNotAcceptable) {
      return {
        status: 'not_accredited',
        label: 'Not Accredited',
        color: '#dc2626',
        bgColor: '#fef2f2',
        description: hasCriticalNotAcceptable 
          ? 'The boarding house has critical safety issues that must be addressed before accreditation can be considered.'
          : 'The boarding house does not meet the minimum required standards. Significant improvements are needed.'
      };
    }
    
    // Conditional: 50-69% and no critical safety issues
    return {
      status: 'conditional',
      label: 'Conditional',
      color: '#d97706',
      bgColor: '#fffbeb',
      description: 'The boarding house meets basic requirements but needs improvements in certain areas. Accreditation may be granted after addressing the identified issues.'
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted successfully! (This is a demo)');
    const calculatedScores = calculateScore();
    const calculatedPrediction = predictAccreditationStatus(calculatedScores);
    console.log('Form Data:', formData);
    console.log('Scores:', calculatedScores);
    console.log('Prediction:', calculatedPrediction);
  };

  // Get current scores and prediction (memoized for performance)
  const scores = useMemo(() => calculateScore(), [formData.evaluationCriteria]);
  const prediction = useMemo(() => predictAccreditationStatus(scores), [scores]);

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

        {/* Evaluation Criteria */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Evaluation Criteria
          </h3>

          {CRITERIA_SECTIONS.map(section => (
            <div key={section.key} style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#1f2937', marginBottom: '12px' }}>{section.label}</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="criteria-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db', minWidth: '200px' }}>Criteria</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #d1d5db', minWidth: '220px' }}>Acceptable (2)</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #d1d5db', minWidth: '220px' }}>Considerable (1)</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #d1d5db', minWidth: '220px' }}>Not Acceptable (0)</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db', minWidth: '200px' }}>Alternative (if not acceptable)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map(item => {
                      const current = formData.evaluationCriteria[section.key][item.key];
                      const hasCriteria = item.criteria && Object.keys(item.criteria).length > 0;
                      return (
                        <React.Fragment key={item.key}>
                          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ textAlign: 'left', verticalAlign: 'top', padding: '12px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}>
                              <strong>{item.label}</strong>
                            </td>
                            {['acceptable', 'considerable', 'not_acceptable'].map(option => (
                              <td key={option} style={{ verticalAlign: 'top', padding: '12px', border: '1px solid #d1d5db', minWidth: '220px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="radio"
                                    name={`${section.key}-${item.key}`}
                                    value={option}
                                    checked={current.status === option}
                                    onChange={() => handleCriteriaStatusChange(section.key, item.key, option)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  {hasCriteria && item.criteria[option] && (
                                    <div style={{ 
                                      fontSize: '11px', 
                                      color: '#4b5563', 
                                      textAlign: 'left',
                                      padding: '6px 8px',
                                      lineHeight: '1.5',
                                      backgroundColor: option === 'acceptable' ? '#f0fdf4' : option === 'considerable' ? '#fffbeb' : '#fef2f2',
                                      borderRadius: '4px',
                                      width: '100%',
                                      border: `1px solid ${option === 'acceptable' ? '#bbf7d0' : option === 'considerable' ? '#fde68a' : '#fecaca'}`
                                    }}>
                                      {item.criteria[option]}
                                    </div>
                                  )}
                                </div>
                              </td>
                            ))}
                            <td style={{ verticalAlign: 'top', padding: '12px', border: '1px solid #d1d5db' }}>
                              <input
                                type="text"
                                value={current.alternative}
                                onChange={(event) => handleCriteriaAlternativeChange(section.key, item.key, event.target.value)}
                                className="form-input"
                                placeholder="Specify alternative"
                                disabled={current.status !== 'not_acceptable'}
                                style={{ width: '100%', minWidth: '150px' }}
                              />
                            </td>
                          </tr>
                        </React.Fragment>
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

        {/* Accreditation Prediction Based on Evaluation Criteria */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Accreditation Prediction
          </h3>

          <div style={{ 
            padding: '20px', 
            borderRadius: '8px', 
            backgroundColor: prediction.bgColor,
            border: `2px solid ${prediction.color}`,
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <h4 style={{ color: prediction.color, margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                  {prediction.label}
                </h4>
                <p style={{ color: '#4b5563', margin: 0, fontSize: '14px' }}>
                  {prediction.description}
                </p>
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: prediction.color,
                textAlign: 'center'
              }}>
                {scores.percentage.toFixed(1)}%
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Overall Score:</span>
                <span style={{ color: '#1f2937', fontWeight: 'bold' }}>
                  {scores.totalScore} / {scores.maxScore} points
                </span>
              </div>
              
              <div style={{ 
                width: '100%', 
                height: '24px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '12px', 
                overflow: 'hidden',
                marginTop: '10px'
              }}>
                <div style={{
                  width: `${scores.percentage}%`,
                  height: '100%',
                  backgroundColor: prediction.color,
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {scores.percentage >= 15 ? `${scores.percentage.toFixed(0)}%` : ''}
                </div>
              </div>
            </div>

            {/* Section Breakdown */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <h5 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '16px' }}>Section Scores:</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {CRITERIA_SECTIONS.map(section => {
                  const sectionScore = scores.sectionScores[section.key];
                  const sectionPercentage = sectionScore.percentage;
                  let sectionColor = '#dc2626';
                  if (sectionPercentage >= 70) sectionColor = '#059669';
                  else if (sectionPercentage >= 50) sectionColor = '#d97706';

                  return (
                    <div key={section.key} style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        marginBottom: '6px'
                      }}>
                        {section.label}
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: sectionColor,
                        marginBottom: '4px'
                      }}>
                        {sectionScore.score} / {sectionScore.max}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${sectionPercentage}%`,
                          height: '100%',
                          backgroundColor: sectionColor,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#6b7280', 
                        marginTop: '4px'
                      }}>
                        {sectionPercentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {scores.hasCriticalNotAcceptable && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626'
              }}>
                <strong>⚠️ Warning:</strong> Critical safety issues have been identified. These must be addressed before accreditation can be granted.
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Result */}
        <div className="card">
          <h3 style={{ color: '#1e40af', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Evaluation Result
          </h3>

          <div className="form-group">
            <label className="form-label">Evaluation Status:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
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
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#0369a1'
            }}>
              <strong>💡 Tip:</strong> The prediction above is based on your evaluation criteria scores. You can override it by manually selecting the evaluation status above if needed.
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
