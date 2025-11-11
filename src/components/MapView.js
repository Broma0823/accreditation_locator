import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths for CRA builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ userRole }) => {
  const [selectedLocation, setSelectedLocation] = useState('tagbilaran');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHouses, setFilteredHouses] = useState([]);
  const mapRef = useRef(null);
  const [startPoint, setStartPoint] = useState(null); // { lat, lng, id, name }
  const [endPoint, setEndPoint] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]); // [[lat,lng], ...]
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

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '15px' }}>
          Boarding House Locations
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

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search boarding houses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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

            {filteredHouses.map((house) => (
              <Marker key={house.id} position={[house.coordinates.lat, house.coordinates.lng]}>
                <Popup>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{house.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{house.address}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>{house.rate}</span>
                      <span style={{ color: '#d97706' }}>⭐ {house.rating}</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 12,
                          backgroundColor: getStatusColor(house.status) + '20',
                          color: getStatusColor(house.status),
                          fontWeight: 'bold'
                        }}
                      >
                        {house.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setStartPoint({ id: house.id, name: house.name, lat: house.coordinates.lat, lng: house.coordinates.lng })}
                      >
                        Set Start
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => setEndPoint({ id: house.id, name: house.name, lat: house.coordinates.lat, lng: house.coordinates.lng })}
                      >
                        Set End
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {routeCoords.length > 1 && (
              <Polyline positions={routeCoords} pathOptions={{ color: '#0ea5e9', weight: 5, opacity: 0.9 }} />
            )}
          </MapContainer>
        </div>
        <div style={{ padding: '8px 12px', color: '#6b7280', fontSize: 14 }}>
          {selectedLocation === 'tagbilaran' ? 'Tagbilaran City' : 'Dauis'} • {filteredHouses.length} boarding houses
          {startPoint && ` • Start: ${startPoint.name}`}
          {endPoint && ` • End: ${endPoint.name}`}
          {startPoint && endPoint && (
            <>
              {` • Est. distance: ${straightDistanceKm.toFixed(2)} km (straight-line)`}
            </>
          )}
        </div>
      </div>

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
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setStartPoint({ id: house.id, name: house.name, lat: house.coordinates.lat, lng: house.coordinates.lng })}
              >
                Set Start
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setEndPoint({ id: house.id, name: house.name, lat: house.coordinates.lat, lng: house.coordinates.lng })}
              >
                Set End
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
