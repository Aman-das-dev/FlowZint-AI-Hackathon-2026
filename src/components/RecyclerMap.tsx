import React, { useEffect, useRef, useState } from 'react';
import { api, type Recycler } from '../services/api';
import { MapPin, Phone, Clock, Star, Navigation, Sparkles, AlertCircle } from 'lucide-react';
import L from 'leaflet';

interface RecyclerMapProps {
  onSelectRecyclerForPickup: (recycler: Recycler) => void;
}

export const RecyclerMap: React.FC<RecyclerMapProps> = ({ onSelectRecyclerForPickup }) => {
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [selectedRecycler, setSelectedRecycler] = useState<Recycler | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeVisible, setRouteVisible] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number]>([28.6139, 77.2090]); // Default to New Delhi, India

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Request real-time location via Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords([latitude, longitude]);
        },
        (error) => {
          console.warn('Geolocation denied or failed. Defaulting to New Delhi:', error);
          setUserCoords([28.6139, 77.2090]);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    // Fetch recyclers from API
    const loadRecyclers = async () => {
      try {
        const data = await api.getRecyclers();
        
        // If we have a custom user coordinate that isn't New Delhi, generate nearby mock options
        const isDefaultDelhi = userCoords[0] === 28.6139 && userCoords[1] === 77.2090;
        
        if (!isDefaultDelhi) {
          const localRecyclers: Recycler[] = [
            {
              id: 101,
              name: "EcoTrack Local Disposal Hub",
              address: "Certified Green Recycle Zone (Nearby)",
              latitude: userCoords[0] + 0.008,
              longitude: userCoords[1] + 0.005,
              pickup_available: true,
              rating: 4.8,
              contact_phone: "+91 99999 88888",
              working_hours: "09:00 AM - 07:00 PM",
              accepted_categories: ["Computers", "Mobile Devices", "Accessories"]
            },
            {
              id: 102,
              name: "E-Waste Solutions & Scrap Point",
              address: "Secondary E-waste Recovery Unit (Nearby)",
              latitude: userCoords[0] - 0.006,
              longitude: userCoords[1] - 0.009,
              pickup_available: true,
              rating: 4.6,
              contact_phone: "+91 98888 77777",
              working_hours: "10:00 AM - 06:00 PM",
              accepted_categories: ["Accessories", "Networking", "Batteries"]
            }
          ];
          setRecyclers([...localRecyclers, ...data]);
          setSelectedRecycler(localRecyclers[0]);
        } else {
          setRecyclers(data);
          if (data.length > 0) {
            setSelectedRecycler(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching recyclers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecyclers();
  }, [userCoords]);

  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    // Initialize Map centered on India/userCoords
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false // Disable default zoom control to place it custom
      }).setView(userCoords, 13);

      // Add elegant light tiles matching our eco theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      // Add custom zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      // Add layer group for markers
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      mapRef.current.setView(userCoords, 13);
    }

    const markersLayer = markersLayerRef.current;

    if (markersLayer) {
      markersLayer.clearLayers();

      // Create Custom User Location Icon
      const userIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
                 <div class="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px]">🏠</div>
               </div>`,
        className: 'user-pin-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Add user marker
      L.marker(userCoords, { icon: userIcon })
        .addTo(markersLayer)
        .bindPopup('<b>Your Current Location</b>');

      // Create Custom Recycler Icons
      recyclers.forEach(rec => {
        const isSelected = selectedRecycler?.id === rec.id;
        const recyclerIcon = L.divIcon({
          html: `<div class="relative flex items-center justify-center transition-transform hover:scale-110">
                   <div class="absolute w-9 h-9 rounded-full ${isSelected ? 'bg-emerald-500/40 animate-pulse' : 'bg-emerald-500/20'}"></div>
                   <div class="w-6.5 h-6.5 rounded-full ${isSelected ? 'bg-emerald-400 text-black border-2 border-white' : 'bg-emerald-800 text-emerald-200 border border-emerald-500/40'} shadow-lg flex items-center justify-center text-xs">🌱</div>
                 </div>`,
          className: 'recycler-pin-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([rec.latitude, rec.longitude], { icon: recyclerIcon })
          .addTo(markersLayer)
          .bindPopup(`<b>${rec.name}</b><br><span style="font-size: 11px;">${rec.address}</span>`);

        marker.on('click', () => {
          setSelectedRecycler(rec);
          setRouteVisible(false); // Reset route
        });
      });
    }

    return () => {
      // Cleanup handled on unmount
    };
  }, [loading, recyclers, selectedRecycler, userCoords]);

  // Handle Route Navigation line
  useEffect(() => {
    if (!mapRef.current || !selectedRecycler) return;

    // Clear previous polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (routeVisible) {
      const destination: [number, number] = [selectedRecycler.latitude, selectedRecycler.longitude];
      
      // Plot simple route line (simulated routing)
      const routeLine = L.polyline([userCoords, destination], {
        color: '#10b981', // Emerald green
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 10',
        lineCap: 'round'
      }).addTo(mapRef.current);

      routePolylineRef.current = routeLine;

      // Fit map boundary to include both points
      const bounds = L.latLngBounds([userCoords, destination]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeVisible, selectedRecycler, userCoords]);

  const handleRouteTrigger = () => {
    setRouteVisible(!routeVisible);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <MapPin className="text-emerald-400" /> Certified Recycler Locator
        </h2>
        <p className="text-gray-400 mt-1">Locate certified recycling hubs, inspect accepted e-waste categories, and plan optimal routing paths.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch h-[600px]">
        
        {/* Left Columns: Interactive Map */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-emerald-500/20 hover:border-emerald-500/40 relative h-[400px] lg:h-full transition-all shadow-xl animate-holo-warp">
          {loading ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-emerald-400 font-semibold animate-pulse">Loading maps engine...</span>
            </div>
          ) : (
            <div ref={mapContainerRef} className="h-full w-full z-0" />
          )}

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-10 bg-[#0f172a]/95 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-lg backdrop-blur-md animate-magnetic-tilt">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> User Position
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2 animate-pulse"></span> Recyclers
          </div>
        </div>

        {/* Right Columns: Recycler Info Details Card */}
        <div className="lg:col-span-4 flex flex-col animate-holo-warp">
          {selectedRecycler ? (
            <div className="rounded-2xl glass-panel p-6 border-white/10 space-y-6 flex-grow flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl animate-electro-hover">
              
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{selectedRecycler.name}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-400" /> {selectedRecycler.address}
                  </p>
                </div>

                {/* Rating & Contact details */}
                <div className="grid grid-cols-2 gap-3">
                  
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ratings</span>
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" /> {selectedRecycler.rating} / 5
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Working Hours</span>
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                      <Clock size={12} className="text-teal-400" /> {selectedRecycler.working_hours}
                    </span>
                  </div>

                </div>

                {/* Phone Contact */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-emerald-400" />
                    <span className="text-gray-400">Phone Contact:</span>
                  </div>
                  <span className="text-white font-semibold">{selectedRecycler.contact_phone}</span>
                </div>

                {/* Accepted Categories */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Accepted Devices</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecycler.accepted_categories.map(cat => (
                      <span 
                        key={cat}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pickup availability Alert banner */}
                {selectedRecycler.pickup_available ? (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
                    <Sparkles size={16} /> Doorstep pickup is available for this facility.
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2.5 text-xs text-amber-400">
                    <AlertCircle size={16} /> Drop-off only. Doorstep pickup not supported.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                <button
                  onClick={handleRouteTrigger}
                  className={`w-full py-3 ${routeVisible ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-emerald-500 text-black hover:bg-emerald-400'} font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm`}
                >
                  <Navigation size={16} /> {routeVisible ? 'Hide Navigation Overlay' : 'Plot Routing Direction'}
                </button>
                {selectedRecycler.pickup_available && (
                  <button
                    onClick={() => onSelectRecyclerForPickup(selectedRecycler)}
                    className="w-full py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Request Doorstep Pickup
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full rounded-2xl border border-white/5 bg-black/20 flex items-center justify-center p-6 text-center text-gray-500">
              <p className="text-sm font-semibold">Select a center on the map to view details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
