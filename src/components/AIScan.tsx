import React, { useState, useRef } from 'react';
import { api, type DeviceSubmission } from '../services/api';
import { Upload, Camera, Sparkles, RefreshCw, Trash2, BatteryCharging, DollarSign, Clock, ShieldAlert } from 'lucide-react';

interface AIScanProps {
  onSuccess: (submission: DeviceSubmission) => void;
  updateUserPoints: (points: number) => void;
}

const PRESET_DEVICES = [
  { label: 'Auto-Detect from Image Name', value: '' },
  { label: 'Smartphone', value: 'smartphone' },
  { label: 'Laptop', value: 'laptop' },
  { label: 'Battery', value: 'battery' },
  { label: 'Charger/Power Adapter', value: 'charger' },
  { label: 'Keyboard', value: 'keyboard' },
  { label: 'Computer Mouse', value: 'mouse' },
  { label: 'Monitor', value: 'monitor' },
  { label: 'Desktop Tower', value: 'desktop' },
  { label: 'Office Printer', value: 'printer' },
  { label: 'Television', value: 'television' },
  { label: 'WiFi Router', value: 'router' },
  { label: 'Wired Earphones', value: 'earphones' },
  { label: 'Tablet', value: 'tablet' },
  { label: 'Smartwatch', value: 'smartwatch' },
];

export const AIScan: React.FC<AIScanProps> = ({ onSuccess, updateUserPoints }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<DeviceSubmission | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Webcam
  const startCamera = async () => {
    setResult(null);
    setPreview(null);
    setFile(null);
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to open webcam: ', err);
      alert('Camera access denied or unavailable. Please upload an image instead.');
      setCameraActive(false);
    }
  };

  // Capture Frame
  const captureFrame = () => {
    if (!videoRef.current || !streamRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const deviceLabel = selectedPreset || 'smartphone';
          const capturedFile = new File([blob], `${deviceLabel}_capture.jpg`, { type: 'image/jpeg' });
          setFile(capturedFile);
          
          const previewUrl = URL.createObjectURL(capturedFile);
          setPreview(previewUrl);
          
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Handle Drag & Drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  // Perform AI scan request
  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setScanning(true);

    try {
      // Send selectedPreset if the user specified a preset device name
      const customLabel = selectedPreset ? selectedPreset : undefined;
      const data = await api.detectDevice(file, customLabel);
      setResult(data);
      onSuccess(data);
      updateUserPoints(50); // Scans add 50 points
    } catch (err) {
      console.error('AI Scan error:', err);
      alert('Failed to analyze the image. Please check your backend connection.');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSelectedPreset('');
    stopCamera();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="text-emerald-400" /> AI Device Identification
          </h2>
          <p className="text-gray-400 mt-1">Upload or capture an electronics image to classify components and estimate recycling value.</p>
        </div>

        {/* Preset Selector for Mock Demonstrations */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 uppercase font-semibold">Demo Preset Override:</label>
          <select 
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-sm text-emerald-400 font-medium cursor-pointer"
          >
            {PRESET_DEVICES.map(p => (
              <option key={p.value} value={p.value} className="bg-[#0b0f19] text-white">{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand side: Scanning Frame & Action Buttons */}
        <div className="lg:col-span-5 space-y-6 animate-holo-warp">
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl border-2 border-dashed border-emerald-500/30 overflow-hidden bg-black/40 flex flex-col items-center justify-center transition-all animate-aurora-glow shadow-xl">
            
            {cameraActive ? (
              <div className="absolute inset-0 flex flex-col justify-between">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Scanner Target Guide Overlay */}
                <div className="absolute inset-8 border border-dashed border-emerald-400/40 pointer-events-none rounded-xl flex items-center justify-center">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0"></div>
                  <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0"></div>
                  <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0"></div>
                  <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0"></div>
                  <div className="text-emerald-400/40 text-xs font-semibold uppercase tracking-widest animate-pulse">Position Device inside Frame</div>
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4 z-10">
                  <button 
                    onClick={captureFrame}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer animate-electro-hover"
                  >
                    <Camera size={18} /> Snap Photo
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="px-6 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-bold text-sm cursor-pointer animate-electro-hover"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : preview ? (
              <div className="absolute inset-0">
                <img 
                  src={preview} 
                  alt="Scanned Preview" 
                  className="w-full h-full object-cover"
                />
                {scanning && (
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] flex items-center justify-center">
                    {/* Scanning Laser Line Animation */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-0 animate-bounce duration-1000"></div>
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-emerald-400" size={32} />
                      <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest animate-pulse">AI Categorization...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-magnetic-tilt">
                  <Upload size={28} />
                </div>
                <div>
                  <p className="font-semibold text-white">Drag & drop device image</p>
                  <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, JPEG up to 10MB</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <label className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 justify-center animate-electro-hover">
                    <Upload size={16} /> Choose File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 justify-center shadow-lg shadow-emerald-500/15 animate-electro-hover"
                  >
                    <Camera size={16} /> Use Camera
                  </button>
                </div>
              </div>
            )}
          </div>

          {preview && !scanning && (
            <div className="flex gap-4">
              <button
                onClick={handleScan}
                disabled={loading}
                className="flex-grow py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-black font-bold rounded-xl transition-all shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={18} /> Analyze with Eco-AI
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-3.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer"
                title="Delete Image"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Right Hand side: Identification Metrics Result Card */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="rounded-2xl glass-panel p-6 border-white/10 space-y-6">
              
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    {result.category}
                  </span>
                  <h3 className="text-3xl font-bold text-white mt-2">{result.device_name}</h3>
                </div>
                
                {/* Confidence Meter */}
                <div className="text-right">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence Score</span>
                  <span className="text-3xl font-extrabold text-white">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Hazard Info & Remaining Life */}
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Hazard Level */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold uppercase tracking-wider">
                    <ShieldAlert size={14} /> Hazard Level
                  </div>
                  <p className="text-white font-medium text-sm sm:text-base leading-snug">{result.hazard_level}</p>
                </div>

                {/* Remaining Life */}
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
                    <Clock size={14} /> Estimated Remaining Life
                  </div>
                  <p className="text-white font-medium text-sm sm:text-base leading-snug">{result.estimated_life_months} Months</p>
                </div>

              </div>

              {/* AI Recycling Values Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-400" /> AI Recycling Value Estimates
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Recycling Value</span>
                    <span className="text-xl font-extrabold text-emerald-400 mt-1.5">${(result.pricing?.recycling_val ?? result.recycling_val).toFixed(2)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/10 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Refurbish Value</span>
                    <span className="text-xl font-extrabold text-teal-400 mt-1.5">${(result.pricing?.repair_val ?? result.repair_val).toFixed(2)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Market Value</span>
                    <span className="text-xl font-extrabold text-cyan-400 mt-1.5">${(result.pricing?.market_val ?? result.market_val).toFixed(2)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Scrap Value</span>
                    <span className="text-xl font-extrabold text-amber-400 mt-1.5">${(result.pricing?.scrap_val ?? result.scrap_val).toFixed(2)}</span>
                  </div>

                </div>
              </div>

              {/* AI Explanation */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} className="text-emerald-400" /> AI Ecological Assessment
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{result.ai_explanation}</p>
              </div>

            </div>
          ) : (
            <div className="h-full rounded-2xl border border-white/5 bg-black/20 flex flex-col items-center justify-center p-8 text-center text-gray-500 min-h-[300px]">
              <BatteryCharging size={40} className="text-gray-600 mb-4 animate-pulse" />
              <p className="font-semibold text-gray-400">Waiting for Image Submission</p>
              <p className="text-xs text-gray-500 max-w-sm mt-1">Upload an image on the left, then click 'Analyze' to trigger the AI device identification process.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
