import React, { useState, useEffect } from 'react';
import { api, type PickupSchedule, type Recycler } from '../services/api';
import { Calendar, Phone, Truck, User, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { State, City } from 'country-state-city';

const indianStates = State.getStatesOfCountry('IN');

interface PickupTrackerProps {
  preselectedRecycler: Recycler | null;
  onClearPreselection: () => void;
  updateUserPoints: (points: number) => void;
}

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  options: { label: string; value: string }[]; 
  placeholder: string; 
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative w-full">
      <button 
        type="button" 
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm cursor-pointer disabled:opacity-50 text-left flex justify-between items-center"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-1 bg-[#0b0f19] border border-emerald-500/30 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar">
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${value === opt.value ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-300 hover:bg-emerald-500/10 hover:text-white'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const STATUS_STEPS = ['Pending', 'Accepted', 'Driver Assigned', 'Picked Up', 'Completed'];

export const PickupTracker: React.FC<PickupTrackerProps> = ({ 
  preselectedRecycler, 
  onClearPreselection,
  updateUserPoints
}) => {
  const [pickups, setPickups] = useState<PickupSchedule[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<PickupSchedule | null>(null);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  
  // Form State
  const [recyclerName, setRecyclerName] = useState('');
  const [recyclerAddress, setRecyclerAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
  };

  // Load Pickups & Recyclers
  const loadData = async () => {
    setFetching(true);
    try {
      const pickupData = await api.getPickups();
      setPickups(pickupData);
      if (pickupData.length > 0) {
        setSelectedPickup(pickupData[0]);
      }
      
      const recyclerData = await api.getRecyclers();
      setRecyclers(recyclerData);
      
      // Auto-set form if a recycler was selected from the map
      if (preselectedRecycler) {
        setRecyclerName(preselectedRecycler.name);
        setRecyclerAddress(preselectedRecycler.address);
      } else if (recyclerData.length > 0) {
        // Use real-time location to find the nearest store
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const sorted = [...recyclerData].sort((a, b) => 
                getDistance(latitude, longitude, a.latitude, a.longitude) - 
                getDistance(latitude, longitude, b.latitude, b.longitude)
              );
              setRecyclers(sorted); // Order dropdown nearest to farthest
              setRecyclerName(sorted[0].name);
              setRecyclerAddress(sorted[0].address);
            },
            (error) => {
              console.warn('Geolocation failed or denied, using default first recycler', error);
              setRecyclerName(recyclerData[0].name);
              setRecyclerAddress(recyclerData[0].address);
            },
            { timeout: 5000 }
          );
        } else {
          setRecyclerName(recyclerData[0].name);
          setRecyclerAddress(recyclerData[0].address);
        }
      }
    } catch (err) {
      console.error('Error fetching pickup data:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedRecycler]);

  // Real-time synchronization polling for active/non-completed pickups
  useEffect(() => {
    const hasActivePickup = pickups.some(p => p.status !== 'Completed');
    if (!hasActivePickup) return;

    const interval = setInterval(async () => {
      try {
        const pickupData = await api.getPickups();
        setPickups(pickupData);
        
        // Synchronize selected pickup state
        if (selectedPickup) {
          const updated = pickupData.find(p => p.id === selectedPickup.id);
          if (updated && updated.status !== selectedPickup.status) {
            setSelectedPickup(updated);
            if (updated.status === 'Completed') {
              updateUserPoints(200); // 200 points for completion
            }
          }
        }
      } catch (err) {
        console.error('Real-time sync polling error:', err);
      }
    }, 3000); // Poll every 3 seconds for responsive live demo updates

    return () => clearInterval(interval);
  }, [pickups, selectedPickup, updateUserPoints]);

  // Handle Recycler selection changes in form
  const handleRecyclerChange = (name: string) => {
    setRecyclerName(name);
    const selected = recyclers.find(r => r.name === name);
    if (selected) {
      setRecyclerAddress(selected.address);
    }
  };

  // Submit Schedule Form
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stateName = indianStates.find(s => s.isoCode === addressState)?.name || addressState;
      const fullAddress = `${addressLine}, ${addressCity}, ${stateName}`;
      await api.schedulePickup({
        recycler_name: recyclerName,
        recycler_address: recyclerAddress,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        address: fullAddress,
        contact_phone: phone
      });
      
      setScheduledSuccess(true);
      updateUserPoints(100); // 100 points for scheduling a pickup
      
      // Clear form
      setPickupDate('');
      setPickupTime('');
      setAddressLine('');
      setAddressCity('');
      setAddressState('');
      setPhone('');
      onClearPreselection();
      
      // Reload and set active
      const refreshedPickups = await api.getPickups();
      setPickups(refreshedPickups);
      setSelectedPickup(refreshedPickups[0]); // Select newly scheduled item
      
      setTimeout(() => setScheduledSuccess(false), 4000);
    } catch (err) {
      console.error('Scheduling error:', err);
      alert('Failed to schedule pickup. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Status Simulation helper (crucial for live hackathon presentation!)
  const simulateStatusStep = async () => {
    if (!selectedPickup) return;
    
    const currentIndex = STATUS_STEPS.indexOf(selectedPickup.status);
    if (currentIndex === -1 || currentIndex === STATUS_STEPS.length - 1) return;
    
    const nextStatus = STATUS_STEPS[currentIndex + 1];
    
    try {
      const updated = await api.updatePickupStatus(selectedPickup.id, nextStatus);
      
      // Update local arrays
      const updatedPickups = pickups.map(p => p.id === updated.id ? { ...p, status: updated.status } : p);
      setPickups(updatedPickups);
      setSelectedPickup({ ...selectedPickup, status: updated.status });
      
      if (updated.status === 'Completed') {
        updateUserPoints(200); // Extra points for completion
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const getStepProgressWidth = (statusStr: string) => {
    const idx = STATUS_STEPS.indexOf(statusStr);
    if (idx === -1) return '0%';
    return `${(idx / (STATUS_STEPS.length - 1)) * 100}%`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Truck className="text-emerald-400" /> Doorstep Pickup Dispatcher
        </h2>
        <p className="text-gray-400 mt-1">Book certified driver collections for bulk electronics and monitor logistical tracking states.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Schedule Form (Col-5) */}
        <div className="lg:col-span-5 space-y-6 animate-holo-warp">
          <div className="rounded-2xl glass-panel p-6 border-white/10 space-y-5 hover:border-emerald-500/30 transition-all shadow-xl animate-electro-hover">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-emerald-400 animate-pulse" size={20} /> Schedule Collection
            </h3>

            {scheduledSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-xs flex items-center gap-2 animate-bounce">
                <Sparkles size={16} /> Pickup Scheduled! You earned 100 EcoPoints.
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-4">
              
              {/* Recycler Center Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Select Collection Center
                </label>
                <CustomSelect
                  value={recyclerName}
                  onChange={(v) => handleRecyclerChange(v)}
                  placeholder="Select Center..."
                  options={recyclers.map(r => ({
                    value: r.name,
                    label: `${r.name} ${r.pickup_available ? '(Pickup OK)' : '(Drop-off Only)'}`
                  }))}
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Time Window
                  </label>
                  <CustomSelect
                    value={pickupTime}
                    onChange={(v) => setPickupTime(v)}
                    placeholder="Select time..."
                    options={[
                      { value: "09:00 AM - 12:00 PM", label: "09:00 AM - 12:00 PM" },
                      { value: "12:00 PM - 03:00 PM", label: "12:00 PM - 03:00 PM" },
                      { value: "03:00 PM - 06:00 PM", label: "03:00 PM - 06:00 PM" }
                    ]}
                  />
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Doorstep Collection Address
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomSelect
                    value={addressState}
                    onChange={(v) => {
                      setAddressState(v);
                      const citiesForState = City.getCitiesOfState('IN', v);
                      if (citiesForState.length > 0) {
                        setAddressCity(citiesForState[0].name);
                      } else {
                        setAddressCity('');
                      }
                    }}
                    placeholder="Select State..."
                    options={indianStates.map(state => ({ value: state.isoCode, label: state.name }))}
                  />

                  <CustomSelect
                    value={addressCity}
                    onChange={(v) => setAddressCity(v)}
                    disabled={!addressState}
                    placeholder="Select City..."
                    options={addressState ? City.getCitiesOfState('IN', addressState).map(city => ({ value: city.name, label: city.name })) : []}
                  />
                </div>

                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Street Address, Area, Landmark"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm placeholder-gray-500"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-emerald-500/15"
              >
                {loading ? 'Creating Booking...' : 'Schedule Pickup Dispatch'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Tracking Dashboard & Stepper (Col-7) */}
        <div className="lg:col-span-7 space-y-6">
          {fetching ? (
            <div className="rounded-2xl border border-white/5 bg-black/20 p-12 text-center text-gray-500">
              <span className="text-emerald-400 font-semibold animate-pulse">Loading scheduled bookings...</span>
            </div>
          ) : pickups.length > 0 && selectedPickup ? (
            <div className="space-y-6">
              
              {/* Grid: Pickups list selector + Active tracker */}
              <div className="rounded-2xl glass-panel p-6 border-white/10 space-y-6">
                
                {/* Selector */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Truck className="text-emerald-400" size={20} /> Active Tracking
                  </h3>
                  <select
                    value={selectedPickup.id}
                    onChange={(e) => {
                      const sel = pickups.find(p => p.id === parseInt(e.target.value));
                      if (sel) setSelectedPickup(sel);
                    }}
                    className="px-3 py-1.5 rounded-lg glass-input text-xs text-emerald-400 cursor-pointer"
                  >
                    {pickups.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0b0f19] text-white">
                        Pickup #{p.id} - {p.recycler_name.substring(0, 15)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracker stepper panel */}
                <div className="space-y-6">
                  
                  {/* Summary */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="block text-[10px] text-gray-500 font-bold uppercase">Center</span>
                      <span className="text-white text-xs font-semibold">{selectedPickup.recycler_name}</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="block text-[10px] text-gray-500 font-bold uppercase">Scheduled Date</span>
                      <span className="text-white text-xs font-semibold">{selectedPickup.pickup_date}</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="block text-[10px] text-gray-500 font-bold uppercase">Time Window</span>
                      <span className="text-white text-xs font-semibold">{selectedPickup.pickup_time}</span>
                    </div>
                  </div>

                  {/* Stepper Graphic */}
                  <div className="space-y-4 py-4">
                    <div className="relative">
                      {/* Bar Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                        style={{ width: getStepProgressWidth(selectedPickup.status) }}
                      ></div>

                      {/* Circles */}
                      <div className="relative z-10 flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const activeIdx = STATUS_STEPS.indexOf(selectedPickup.status);
                          const isCompleted = idx < activeIdx;
                          const isCurrent = idx === activeIdx;
                          return (
                            <div key={step} className="flex flex-col items-center gap-1.5">
                              <div 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300
                                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-black' : 
                                    isCurrent ? 'bg-[#0f172a] border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/20' : 
                                    'bg-[#0f172a] border-white/15 text-gray-500'}`}
                              >
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between text-[10px] sm:text-xs font-semibold text-gray-400 px-1">
                      {STATUS_STEPS.map((step) => (
                        <span key={step} className={selectedPickup.status === step ? 'text-emerald-400 font-bold' : ''}>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Driver Details Card */}
                  {selectedPickup.driver_name && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">Driver Assigned</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{selectedPickup.driver_name} (Eco-Courier)</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Phone size={12} className="text-emerald-400" /> {selectedPickup.driver_phone}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Simulation controller */}
                  {selectedPickup.status !== 'Completed' && (
                    <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <span className="font-bold text-teal-400 flex items-center gap-1 justify-center sm:justify-start">
                          <RefreshCw size={14} className="animate-spin" /> Logistics Simulation Mode
                        </span>
                        <p className="text-gray-400 mt-0.5">Manually advance the driver pickup lifecycle for testing.</p>
                      </div>
                      <button
                        onClick={simulateStatusStep}
                        className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold cursor-pointer transition-colors"
                      >
                        Advance Logistical Step
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-black/20 p-8 sm:p-10 text-center text-gray-500 min-h-[260px] flex flex-col items-center justify-center">
              <Truck size={48} className="text-gray-600 mb-4 animate-bounce" />
              <p className="font-semibold text-gray-400">No Scheduled Pickups</p>
              <p className="text-xs text-gray-500 max-w-sm mt-1">Book a collection using the scheduler on the left or select a certified recycler on the map locator tab.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
