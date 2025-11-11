import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths for CRA builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create custom Boarding House icon (blue pin) - memoized to avoid recreating on every render
const boardingHouseIcon = L.divIcon({
  className: 'boarding-house-marker',
  html: '<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); position: relative;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); color: white; font-size: 14px; line-height: 1;">🏠</div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const MapView = ({ userRole }) => {
  const [selectedLocation, setSelectedLocation] = useState('tagbilaran');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHouses, setFilteredHouses] = useState([]);
  const mapRef = useRef(null);
  const [startPoint, setStartPoint] = useState(null); // { lat, lng, id, name }
  const [endPoint, setEndPoint] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]); // [[lat,lng], ...]
  // Load saved boarding houses from localStorage on mount
  const loadSavedBoardingHouses = () => {
    try {
      const saved = localStorage.getItem('boardingHouses');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.houses || [];
      }
    } catch (error) {
      console.error('Error loading saved boarding houses:', error);
    }
    return [];
  };

  const loadSavedIdCounter = () => {
    try {
      const saved = localStorage.getItem('boardingHouses');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.lastId || 0;
      }
    } catch (error) {
      console.error('Error loading saved ID counter:', error);
    }
    return 0;
  };

  const [userAddedBoardingHouses, setUserAddedBoardingHouses] = useState(() => loadSavedBoardingHouses()); // Array of { id, lat, lng, name, address, rate, rooms, contact, notes }
  const [isAddingBoardingHouse, setIsAddingBoardingHouse] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingBoardingHouse, setEditingBoardingHouse] = useState(null); // { id, lat, lng, name, address, rate, rooms, contact, notes }
  const [selectedBoardingHouseForZoom, setSelectedBoardingHouseForZoom] = useState(null); // { lat, lng } for zooming in main map
  const [selectedBoardingHouseForZoomModal, setSelectedBoardingHouseForZoomModal] = useState(null); // { lat, lng } for zooming in modal map
  const boardingHouseIdCounter = useRef(loadSavedIdCounter() + 1);
  const isReverseGeocodingRef = useRef(false);

  // Save boarding houses to localStorage
  const saveBoardingHouses = (houses) => {
    try {
      const maxId = houses.length > 0 
        ? Math.max(...houses.map(h => h.id || 0))
        : boardingHouseIdCounter.current - 1;
      localStorage.setItem('boardingHouses', JSON.stringify({
        houses: houses,
        lastId: maxId,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving boarding houses:', error);
    }
  };
  const haversineKm = (a, b) => {
    if (!a || !b) return 0;
    const R = 6371; // km
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat/2) ** 2 + Math.sin(dLng/2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const d = 2 * R * Math.asin(Math.sqrt(x));
    return d;
  };
  const straightDistanceKm = useMemo(() => haversineKm(startPoint, endPoint), [startPoint, endPoint]);

  // Mock data for boarding houses - moved outside component to avoid recreation on every render
  const boardingHouses = useMemo(() => ({
    tagbilaran: [
      {
        id: 1,
        name: "Sunrise Boarding House",
        address: "J.A. Clarin St., Tagbilaran City",
        rate: "₱2,800/month",
        amenities: ["WiFi", "AC", "Security"],
        rooms: 12,
        available: 3,
        rating: 4.5,
        coordinates: { lat: 9.6725, lng: 123.8563 },
        status: "Accredited",
        features: ["Fire Extinguisher", "Gate & Fence", "Curfew", "House Rules"]
      },
      {
        id: 2,
        name: "Mountain Peak Boarding",
        address: "Mansasa, Tagbilaran City",
        rate: "₱2,500/month",
        amenities: ["WiFi", "Quiet Area"],
        rooms: 8,
        available: 2,
        rating: 4.2,
        coordinates: { lat: 9.6750, lng: 123.8600 },
        status: "Accredited",
        features: ["Fire Extinguisher", "Gate & Fence", "Logbook"]
      },
      {
        id: 3,
        name: "City Center Lodge",
        address: "CPG Avenue, Tagbilaran City",
        rate: "₱3,000/month",
        amenities: ["WiFi", "AC", "Near School"],
        rooms: 15,
        available: 5,
        rating: 4.7,
        coordinates: { lat: 9.6680, lng: 123.8480 },
        status: "Conditional",
        features: ["Fire Extinguisher", "Gate & Fence"]
      },
      {
        id: 4,
        name: "Bohol Student Inn",
        address: "Gallares St., Tagbilaran City",
        rate: "₱2,200/month",
        amenities: ["WiFi", "Study Area"],
        rooms: 10,
        available: 4,
        rating: 4.0,
        coordinates: { lat: 9.6700, lng: 123.8520 },
        status: "Accredited",
        features: ["Fire Extinguisher", "House Rules", "Curfew"]
      }
    ],
    dauis: [
      {
        id: 5,
        name: "Ocean View Lodge",
        address: "Dauis, Bohol",
        rate: "₱2,200/month",
        amenities: ["WiFi", "Near Beach"],
        rooms: 6,
        available: 2,
        rating: 4.3,
        coordinates: { lat: 9.6250, lng: 123.8700 },
        status: "Accredited",
        features: ["Fire Extinguisher", "Gate & Fence", "Logbook"]
      },
      {
        id: 6,
        name: "Seaside Boarding House",
        address: "Dauis, Bohol",
        rate: "₱2,000/month",
        amenities: ["WiFi"],
        rooms: 8,
        available: 3,
        rating: 4.1,
        coordinates: { lat: 9.6200, lng: 123.8750 },
        status: "Conditional",
        features: ["Fire Extinguisher"]
      },
      {
        id: 7,
        name: "Dauis Student Home",
        address: "Dauis, Bohol",
        rate: "₱2,400/month",
        amenities: ["WiFi", "AC", "Quiet"],
        rooms: 5,
        available: 1,
        rating: 4.4,
        coordinates: { lat: 9.6150, lng: 123.8650 },
        status: "Accredited",
        features: ["Fire Extinguisher", "Gate & Fence", "House Rules", "Curfew"]
      }
    ]
  }), []);

  // Geographic bounds covering Tagbilaran City and Dauis (Bohol)
  const dauisTagbilaranBounds = useMemo(() => {
    // SouthWest, NorthEast
    return L.latLngBounds(
      [9.5900, 123.8200],
      [9.7100, 123.9200]
    );
  }, []);

  const locationCenters = useMemo(() => ({
    tagbilaran: { lat: 9.6700, lng: 123.8550, zoom: 14 },
    dauis: { lat: 9.6220, lng: 123.8700, zoom: 14 },
  }), []);

  const FitToLocation = ({ selected }) => {
    const map = useMap();
    useEffect(() => {
      const loc = locationCenters[selected] || locationCenters.tagbilaran;
      // Pan within max bounds and set an appropriate view
      map.setMaxBounds(dauisTagbilaranBounds);
      map.fitBounds(dauisTagbilaranBounds, { padding: [20, 20] });
      map.setView([loc.lat, loc.lng], loc.zoom, { animate: true });
    }, [selected, map, locationCenters, dauisTagbilaranBounds]);
    return null;
  };

  // Component to handle map clicks for adding Boarding Houses
  const MapClickHandler = ({ isAddingBoardingHouse, onMapClick, isModal = false }) => {
    useMapEvents({
      click: (e) => {
        if (isAddingBoardingHouse) {
          onMapClick(e.latlng, isModal);
        }
      }
    });
    return null;
  };

  // Component to zoom to a specific location
  const ZoomToLocation = ({ lat, lng, zoom = 16 }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng], zoom, { animate: true, duration: 0.5 });
      }
    }, [lat, lng, zoom, map]);
    return null;
  };

  useEffect(() => {
    const houses = boardingHouses[selectedLocation] || [];
    const filtered = houses.filter(house =>
      house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHouses(filtered);
  }, [selectedLocation, searchTerm, boardingHouses]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accredited': return '#059669';
      case 'Conditional': return '#d97706';
      case 'Not Accredited': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Build and draw shortest path using backend routing API
  useEffect(() => {
    const fetchRoute = async () => {
      if (!startPoint || !endPoint) {
        setRouteCoords([]);
        return;
      }
      try {
        const params = new URLSearchParams({
          startLat: String(startPoint.lat),
          startLng: String(startPoint.lng),
          endLat: String(endPoint.lat),
          endLng: String(endPoint.lng),
        });
        const res = await fetch(`http://localhost:4000/api/route?${params.toString()}`);
        if (!res.ok) throw new Error('Routing failed');
        const geo = await res.json();
        const geom = geo.geometry;
        const toLatLng = (coords) => coords.map(([lng, lat]) => [lat, lng]);
        let points = [];
        if (geom?.type === 'LineString') {
          points = toLatLng(geom.coordinates);
        } else if (geom?.type === 'MultiLineString') {
          points = geom.coordinates.flatMap((ls) => toLatLng(ls));
        }
        setRouteCoords(points);
      } catch (e) {
        console.error(e);
        // Fallback: draw straight line between points if routing backend is unavailable
        setRouteCoords([[startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]]);
      }
    };
    fetchRoute();
  }, [startPoint, endPoint]);

  // Reverse geocode helper (OpenStreetMap Nominatim)
  const fetchAddressFor = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) return '';
      const data = await res.json();
      return data.display_name || '';
    } catch {
      return '';
    }
  };

  // Handle map click for adding Boarding House
  const handleMapClick = (latlng, isModal = false) => {
    if (isAddingBoardingHouse) {
      const newBoardingHouse = {
        id: boardingHouseIdCounter.current++,
        lat: latlng.lat,
        lng: latlng.lng,
        name: `Boarding House ${boardingHouseIdCounter.current - 1}`,
        address: '',
        rate: '',
        rooms: '',
        contact: '',
        notes: ''
      };
      setEditingBoardingHouse(newBoardingHouse);
      setIsAddingBoardingHouse(false);
      
      // Close modal if opened from modal
      if (isModal) {
        setShowMapModal(false);
      }
      
      // Fire and forget reverse geocoding to auto-fill address field
      if (!isReverseGeocodingRef.current) {
        isReverseGeocodingRef.current = true;
        fetchAddressFor(latlng.lat, latlng.lng).then((addr) => {
          setEditingBoardingHouse((prev) => {
            if (!prev || prev.id !== newBoardingHouse.id) return prev;
            return { ...prev, address: addr || '' };
          });
        }).finally(() => {
          isReverseGeocodingRef.current = false;
        });
      }
    }
  };

  // Save Boarding House after editing
  const handleSaveBoardingHouse = () => {
    if (editingBoardingHouse) {
      setUserAddedBoardingHouses(prev => {
        const existingIndex = prev.findIndex(bh => bh.id === editingBoardingHouse.id);
        let updated;
        if (existingIndex >= 0) {
          // Update existing Boarding House
          updated = [...prev];
          updated[existingIndex] = editingBoardingHouse;
        } else {
          // Add new Boarding House
          updated = [...prev, editingBoardingHouse];
        }
        // Save to localStorage
        saveBoardingHouses(updated);
        return updated;
      });
      setEditingBoardingHouse(null);
    }
  };

  // Delete Boarding House
  const handleDeleteBoardingHouse = (boardingHouseId) => {
    setUserAddedBoardingHouses(prev => {
      const updated = prev.filter(bh => bh.id !== boardingHouseId);
      // Save to localStorage
      saveBoardingHouses(updated);
      return updated;
    });
    if (editingBoardingHouse && editingBoardingHouse.id === boardingHouseId) {
      setEditingBoardingHouse(null);
    }
  };

  // Cancel adding/editing Boarding House
  const handleCancelBoardingHouse = () => {
    setIsAddingBoardingHouse(false);
    if (editingBoardingHouse && !userAddedBoardingHouses.find(bh => bh.id === editingBoardingHouse.id)) {
      // If it's a new Boarding House that hasn't been saved, just cancel
      setEditingBoardingHouse(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '15px' }}>
          Map View - Boarding Houses
        </h2>
        
        {/* Location Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '10px'
        }}>
          <button
            className={`btn ${selectedLocation === 'tagbilaran' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedLocation('tagbilaran')}
          >
            Tagbilaran City
          </button>
          <button
            className={`btn ${selectedLocation === 'dauis' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedLocation('dauis')}
          >
            Dauis
          </button>
        </div>

        {/* Search Bar and Boarding House Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-container" style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search boarding houses in list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsAddingBoardingHouse(true);
                setShowMapModal(true);
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              Add Boarding House
            </button>
            {userAddedBoardingHouses.length > 0 && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all boarding houses from the map? This will also delete them from saved data.')) {
                      setUserAddedBoardingHouses([]);
                      setEditingBoardingHouse(null);
                      // Clear from localStorage
                      saveBoardingHouses([]);
                    }
                  }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Clear All ({userAddedBoardingHouses.length})
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const dataStr = JSON.stringify(userAddedBoardingHouses, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `boarding-houses-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ whiteSpace: 'nowrap' }}
                  title="Export boarding houses data as JSON file"
                >
                  Export Data
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Map (Leaflet) */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="map-container" style={{ height: '420px', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer
            ref={mapRef}
            center={[locationCenters[selectedLocation].lat, locationCenters[selectedLocation].lng]}
            zoom={locationCenters[selectedLocation].zoom}
            style={{ height: '100%', width: '100%' }}
            maxBounds={dauisTagbilaranBounds}
            maxBoundsViscosity={1.0}
            minZoom={12}
            maxZoom={18}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <FitToLocation selected={selectedLocation} />
            <MapClickHandler isAddingBoardingHouse={false} onMapClick={handleMapClick} isModal={false} />

            {routeCoords.length > 1 && (
              <Polyline positions={routeCoords} pathOptions={{ color: '#0ea5e9', weight: 5, opacity: 0.9 }} />
            )}

            {/* Zoom to selected boarding house */}
            {selectedBoardingHouseForZoom && (
              <ZoomToLocation 
                lat={selectedBoardingHouseForZoom.lat} 
                lng={selectedBoardingHouseForZoom.lng} 
                zoom={16}
              />
            )}

            {/* User-Added Boarding House Markers */}
            {userAddedBoardingHouses.map((boardingHouse) => (
              <Marker
                key={boardingHouse.id}
                position={[boardingHouse.lat, boardingHouse.lng]}
                icon={boardingHouseIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedBoardingHouseForZoom({ lat: boardingHouse.lat, lng: boardingHouse.lng });
                  }
                }}
              >
                <Popup
                  onOpen={() => {
                    setSelectedBoardingHouseForZoom({ lat: boardingHouse.lat, lng: boardingHouse.lng });
                  }}
                  onClose={() => {
                    // Optional: reset zoom state when popup closes, or leave it for better UX
                    // setSelectedBoardingHouseForZoom(null);
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#3b82f6' }}>
                      {boardingHouse.name}
                    </div>
                    {boardingHouse.address && (
                      <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 6 }}>
                        {boardingHouse.address}
                      </div>
                    )}
                    {boardingHouse.notes && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                        {boardingHouse.notes}
                      </div>
                    )}
                    {(boardingHouse.rate || boardingHouse.rooms || boardingHouse.contact) && (
                      <div style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                        {boardingHouse.rate && <span style={{ marginRight: 10 }}>Rate: {boardingHouse.rate}</span>}
                        {boardingHouse.rooms && <span style={{ marginRight: 10 }}>Rooms: {boardingHouse.rooms}</span>}
                        {boardingHouse.contact && <span>Contact: {boardingHouse.contact}</span>}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
                      Lat: {boardingHouse.lat.toFixed(6)}, Lng: {boardingHouse.lng.toFixed(6)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setStartPoint({ id: boardingHouse.id, name: boardingHouse.name, lat: boardingHouse.lat, lng: boardingHouse.lng })}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Set Start
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => setEndPoint({ id: boardingHouse.id, name: boardingHouse.name, lat: boardingHouse.lat, lng: boardingHouse.lng })}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Set End
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingBoardingHouse(boardingHouse)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDeleteBoardingHouse(boardingHouse.id)}
                        style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dc2626', color: 'white' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div style={{ padding: '8px 12px', color: '#6b7280', fontSize: 14 }}>
          {selectedLocation === 'tagbilaran' ? 'Tagbilaran City' : 'Dauis'}
          {userAddedBoardingHouses.length > 0 && ` • ${userAddedBoardingHouses.length} Boarding House${userAddedBoardingHouses.length > 1 ? 's' : ''} on map`}
          {userAddedBoardingHouses.length === 0 && ' • No boarding houses on map'}
          {startPoint && ` • Start: ${startPoint.name}`}
          {endPoint && ` • End: ${endPoint.name}`}
          {startPoint && endPoint && (
            <>
              {` • Est. distance: ${straightDistanceKm.toFixed(2)} km (straight-line)`}
            </>
          )}
        </div>
      </div>

      {/* Map Modal for Adding Boarding House */}
      {showMapModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '90vw',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ color: '#1e40af', margin: 0 }}>
                🏠 Click on the map to add a Boarding House
              </h3>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowMapModal(false);
                  setIsAddingBoardingHouse(false);
                  setSelectedBoardingHouseForZoomModal(null);
                }}
                style={{ padding: '8px 16px' }}
              >
                ✕ Close
              </button>
            </div>
            
            {/* Map Container in Modal */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%' }}>
                <MapContainer
                  center={[locationCenters[selectedLocation].lat, locationCenters[selectedLocation].lng]}
                  zoom={locationCenters[selectedLocation].zoom}
                  style={{ height: '100%', width: '100%' }}
                  maxBounds={dauisTagbilaranBounds}
                  maxBoundsViscosity={1.0}
                  minZoom={12}
                  maxZoom={18}
                  scrollWheelZoom
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <FitToLocation selected={selectedLocation} />
                  <MapClickHandler isAddingBoardingHouse={isAddingBoardingHouse} onMapClick={handleMapClick} isModal={true} />
                  
                  {/* Zoom to selected boarding house in modal */}
                  {selectedBoardingHouseForZoomModal && (
                    <ZoomToLocation 
                      lat={selectedBoardingHouseForZoomModal.lat} 
                      lng={selectedBoardingHouseForZoomModal.lng} 
                      zoom={16}
                    />
                  )}
                  
                  {/* Show existing boarding houses on modal map */}
                  {userAddedBoardingHouses.map((boardingHouse) => (
                    <Marker
                      key={boardingHouse.id}
                      position={[boardingHouse.lat, boardingHouse.lng]}
                      icon={boardingHouseIcon}
                      eventHandlers={{
                        click: () => {
                          setSelectedBoardingHouseForZoomModal({ lat: boardingHouse.lat, lng: boardingHouse.lng });
                        }
                      }}
                    >
                      <Popup
                        onOpen={() => {
                          setSelectedBoardingHouseForZoomModal({ lat: boardingHouse.lat, lng: boardingHouse.lng });
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#3b82f6' }}>
                            {boardingHouse.name}
                          </div>
                          {boardingHouse.address && (
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                              {boardingHouse.address}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: '15px 20px',
              borderTop: '2px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                <strong>Tip:</strong> Click anywhere on the map to place a new boarding house
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowMapModal(false);
                  setIsAddingBoardingHouse(false);
                  setSelectedBoardingHouseForZoomModal(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boarding House Edit Modal */}
      {editingBoardingHouse && (
        <div className="card" style={{ marginBottom: '20px', border: '2px solid #3b82f6' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>
            {userAddedBoardingHouses.find(bh => bh.id === editingBoardingHouse.id) ? 'Edit Boarding House' : 'New Boarding House'}
          </h3>
          <div className="form-group">
            <label className="form-label">Boarding House Name:</label>
            <input
              type="text"
              value={editingBoardingHouse.name}
              onChange={(e) => setEditingBoardingHouse({ ...editingBoardingHouse, name: e.target.value })}
              className="form-input"
              placeholder="Enter boarding house name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address:</label>
            <input
              type="text"
              value={editingBoardingHouse.address || ''}
              onChange={(e) => setEditingBoardingHouse({ ...editingBoardingHouse, address: e.target.value })}
              className="form-input"
              placeholder="Auto-filled when added on map; you can edit it"
            />
          </div>
          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Rate (e.g., ₱2,500/month):</label>
              <input
                type="text"
                value={editingBoardingHouse.rate || ''}
                onChange={(e) => setEditingBoardingHouse({ ...editingBoardingHouse, rate: e.target.value })}
                className="form-input"
                placeholder="₱0/month"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rooms:</label>
              <input
                type="number"
                value={editingBoardingHouse.rooms || ''}
                onChange={(e) => setEditingBoardingHouse({ ...editingBoardingHouse, rooms: e.target.value })}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact:</label>
              <input
                type="text"
                value={editingBoardingHouse.contact || ''}
                onChange={(e) => setEditingBoardingHouse({ ...editingBoardingHouse, contact: e.target.value })}
                className="form-input"
                placeholder="Contact person/number"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional):</label>
            <textarea
              value={editingBoardingHouse.notes || ''}
              onChange={(e) => setEditingBoardingHouse({ ...editingBoardingHouse, notes: e.target.value })}
              className="form-textarea"
              placeholder="Additional details..."
              rows="3"
            />
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '15px' }}>
            Location: {editingBoardingHouse.lat.toFixed(6)}, {editingBoardingHouse.lng.toFixed(6)}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSaveBoardingHouse}
            >
              Save Boarding House
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelBoardingHouse}
            >
              Cancel
            </button>
            {userAddedBoardingHouses.find(bh => bh.id === editingBoardingHouse.id) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this boarding house?')) {
                    handleDeleteBoardingHouse(editingBoardingHouse.id);
                  }
                }}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Boarding Houses List */}
      <div className="grid grid-2">
        {filteredHouses.map(house => (
          <div key={house.id} className="card" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <h3 style={{ color: '#1e40af', margin: 0 }}>{house.name}</h3>
              <span 
                style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: getStatusColor(house.status) + '20',
                  color: getStatusColor(house.status)
                }}
              >
                {house.status}
              </span>
            </div>
            
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>{house.address}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#059669', fontSize: '18px' }}>{house.rate}</strong>
                <br />
                <small style={{ color: '#6b7280' }}>
                  {house.available} of {house.rooms} rooms available
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#d97706', fontWeight: 'bold' }}>⭐ {house.rating}</div>
                <small style={{ color: '#6b7280' }}>Rating</small>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1e40af', fontSize: '14px' }}>Amenities:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                {house.amenities.map((amenity, index) => (
                  <span 
                    key={index}
                    style={{ 
                      padding: '2px 8px', 
                      backgroundColor: '#eff6ff', 
                      color: '#1e40af',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1e40af', fontSize: '14px' }}>Safety Features:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                {house.features.map((feature, index) => (
                  <span 
                    key={index}
                    style={{ 
                      padding: '2px 8px', 
                      backgroundColor: '#f0fdf4', 
                      color: '#059669',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                View Details
              </button>
              {userRole === 'student' && (
                <button className="btn btn-success" style={{ flex: 1 }}>
                  Contact
                </button>
              )}
              {userRole === 'admin' && (
                <button className="btn btn-secondary" style={{ flex: 1 }}>
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredHouses.length === 0 && (
        <div className="card text-center">
          <h3 style={{ color: '#6b7280' }}>No boarding houses found</h3>
          <p style={{ color: '#6b7280' }}>Try adjusting your search terms or location.</p>
        </div>
      )}

      {/* User-Added Boarding Houses List */}
      {userAddedBoardingHouses.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>
            Boarding Houses on Map ({userAddedBoardingHouses.length})
          </h3>
          <div className="grid grid-2">
            {userAddedBoardingHouses.map(boardingHouse => (
              <div key={boardingHouse.id} className="card" style={{ marginBottom: '15px', border: '2px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ color: '#3b82f6', margin: 0 }}>🏠 {boardingHouse.name}</h4>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDeleteBoardingHouse(boardingHouse.id)}
                    style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Delete
                  </button>
                </div>
                {boardingHouse.address && (
                  <p style={{ color: '#4b5563', marginBottom: '8px', fontSize: '14px' }}>
                    {boardingHouse.address}
                  </p>
                )}
                {boardingHouse.notes && (
                  <p style={{ color: '#6b7280', marginBottom: '10px', fontSize: '14px' }}>
                    {boardingHouse.notes}
                  </p>
                )}
                {(boardingHouse.rate || boardingHouse.rooms || boardingHouse.contact) && (
                  <div style={{ fontSize: '12px', color: '#374151', marginBottom: '10px' }}>
                    {boardingHouse.rate && <span style={{ marginRight: 10 }}>Rate: {boardingHouse.rate}</span>}
                    {boardingHouse.rooms && <span style={{ marginRight: 10 }}>Rooms: {boardingHouse.rooms}</span>}
                    {boardingHouse.contact && <span>Contact: {boardingHouse.contact}</span>}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                  Coordinates: {boardingHouse.lat.toFixed(6)}, {boardingHouse.lng.toFixed(6)}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStartPoint({ id: boardingHouse.id, name: boardingHouse.name, lat: boardingHouse.lat, lng: boardingHouse.lng })}
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                  >
                    Set Start
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setEndPoint({ id: boardingHouse.id, name: boardingHouse.name, lat: boardingHouse.lat, lng: boardingHouse.lng })}
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                  >
                    Set End
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedBoardingHouseForZoom({ lat: boardingHouse.lat, lng: boardingHouse.lng });
                      // Scroll to map if needed
                      document.querySelector('.map-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }}
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                    title="Zoom to this location on map"
                  >
                    🔍 Zoom to Map
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditingBoardingHouse(boardingHouse)}
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Statistics */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>
          {selectedLocation === 'tagbilaran' ? 'Tagbilaran City' : 'Dauis'} Statistics
        </h3>
        <div className="grid grid-3">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              {boardingHouses[selectedLocation]?.length || 0}
            </div>
            <small style={{ color: '#6b7280' }}>Total Boarding Houses</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
              {boardingHouses[selectedLocation]?.reduce((sum, house) => sum + house.rooms, 0) || 0}
            </div>
            <small style={{ color: '#6b7280' }}>Total Rooms</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
              {boardingHouses[selectedLocation]?.reduce((sum, house) => sum + house.available, 0) || 0}
            </div>
            <small style={{ color: '#6b7280' }}>Available Rooms</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
