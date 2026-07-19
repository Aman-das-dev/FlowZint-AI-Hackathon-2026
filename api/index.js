const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];
  
  // Fallback to query parameter token if not in headers (e.g. /api/auth/me?token=...)
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) return res.status(401).json({ error: 'Missing token' });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
};

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }
      }
    });
    if (error) throw error;
    res.json({
      access_token: data.session?.access_token || '',
      token_type: 'bearer',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata?.full_name || full_name,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        eco_points: 100
      }
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json({
      access_token: data.session?.access_token,
      token_type: 'bearer',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata?.full_name || email.split('@')[0],
        avatar_url: data.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        eco_points: data.user?.user_metadata?.eco_points || 100
      }
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, full_name, avatar_url } = req.body;
    // For Vercel Serverless environment, we mock this token exchange or return success if details are provided
    res.json({
      access_token: 'mock-google-token',
      token_type: 'bearer',
      user: {
        id: 'google-user-id',
        email,
        full_name,
        avatar_url,
        eco_points: 150
      }
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

app.post('/api/auth/otp/send', async (req, res) => {
  try {
    const { phone_or_email } = req.body;
    const isEmail = phone_or_email.includes('@');
    
    let options = {};
    if (isEmail) {
      options.email = phone_or_email;
    } else {
      options.phone = phone_or_email;
    }
    
    const { error } = await supabase.auth.signInWithOtp(options);
    if (error) throw error;
    
    res.json({
      success: true,
      message: `Verification code sent to ${phone_or_email}.`,
      dev_otp: '123456' // Fallback for local testing
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

app.post('/api/auth/otp/verify', async (req, res) => {
  try {
    const { phone_or_email, otp_code, full_name } = req.body;
    const isEmail = phone_or_email.includes('@');
    
    let options = {
      token: otp_code,
      type: isEmail ? 'email' : 'sms'
    };
    if (isEmail) {
      options.email = phone_or_email;
    } else {
      options.phone = phone_or_email;
    }
    
    const { data, error } = await supabase.auth.verifyOtp(options);
    if (error) throw error;
    
    res.json({
      access_token: data.session?.access_token,
      token_type: 'bearer',
      user: {
        id: data.user?.id,
        email: data.user?.email || phone_or_email,
        full_name: data.user?.user_metadata?.full_name || full_name || 'Eco User',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone_or_email}`,
        eco_points: 150
      }
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', req.user.id);
      
    const { data: submissions } = await supabase
      .from('device_submissions')
      .select('*')
      .eq('user_id', req.user.id);

    const { data: pickups } = await supabase
      .from('pickup_schedules')
      .select('*')
      .eq('user_id', req.user.id);

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.user_metadata?.full_name || req.user.email.split('@')[0],
        avatar_url: req.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.user.email}`,
        eco_points: req.user.user_metadata?.eco_points || 150
      },
      achievements: achievements || [],
      stats: {
        total_recycled: submissions?.length || 0,
        pickups_scheduled: pickups?.length || 0
      }
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// --- DEVICE SUBMISSION ENDPOINTS ---

app.get('/api/devices/history', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('device_submissions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/devices/history', authenticate, async (req, res) => {
  try {
    const submission = req.body;
    const { data, error } = await supabase
      .from('device_submissions')
      .insert({ ...submission, user_id: req.user.id })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete('/api/devices/history', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('device_submissions')
      .delete()
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/devices/detect', authenticate, async (req, res) => {
  // Mock detection with Gemini fallback parameters
  res.json({
    id: Date.now(),
    device_name: req.body.custom_label || "Smartphone",
    category: "Mobile Devices",
    confidence: 0.95,
    hazard_level: "Medium",
    estimated_life_months: 18,
    market_val: 45.00,
    recycling_val: 15.50,
    repair_val: 25.00,
    scrap_val: 4.50,
    ai_explanation: "This device is identified as a portable electronic smartphone containing valuable elements like copper, gold, and minor quantities of lithium in the battery core.",
    image_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
    submitted_at: new Date().toISOString()
  });
});

// --- RECYCLER & PICKUP ENDPOINTS ---

app.get('/api/recyclers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('recyclers').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get('/api/pickups', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pickup_schedules')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/pickups', authenticate, async (req, res) => {
  try {
    const { recycler_name, recycler_address, pickup_date, pickup_time, address, contact_phone } = req.body;
    const { data, error } = await supabase
      .from('pickup_schedules')
      .insert({
        user_id: req.user.id,
        recycler_name,
        recycler_address,
        pickup_date,
        pickup_time,
        address,
        contact_phone,
        status: 'Pending'
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/pickups/:pickupId/update-status', authenticate, async (req, res) => {
  try {
    const { pickupId } = req.params;
    const { status } = req.query;
    const { data, error } = await supabase
      .from('pickup_schedules')
      .update({ status })
      .eq('id', pickupId)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// --- DASHBOARD & LEADERBOARD ENDPOINTS ---

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { data: submissions } = await supabase.from('device_submissions').select('*');
    const { data: pickups } = await supabase.from('pickup_schedules').select('*');

    const total_users = 15; // Mock for visual dashboard presentation
    const total_devices = submissions?.length || 0;
    const total_pickups = pickups?.length || 0;

    const carbon_saved = total_devices * 15.5;
    const water_saved = total_devices * 45.0;
    const trees_eq = carbon_saved * 0.04;
    const plastic_recycled = total_devices * 1.8;
    const metals_recovered = total_devices * 1.2;

    const total_revenue = total_devices * 49.5;

    res.json({
      metrics: {
        carbon_saved: Math.round(carbon_saved * 10) / 10,
        trees_equivalent: Math.round(trees_eq * 10) / 10,
        water_saved: Math.round(water_saved * 10) / 10,
        plastic_recycled: Math.round(plastic_recycled * 10) / 10,
        metals_recovered: Math.round(metals_recovered * 10) / 10,
        total_devices_recycled: total_devices,
        total_users,
        total_pickups,
        active_recyclers: 5,
        total_revenue: Math.round(total_revenue * 100) / 100
      },
      device_categories: [
        { name: "Mobile Devices", value: 35 },
        { name: "Computers", value: 45 },
        { name: "Displays", value: 15 },
        { name: "Others", value: 5 }
      ],
      historical_analytics: [
        { month: "Jan", pickups: 4, carbon: 62 },
        { month: "Feb", pickups: 8, carbon: 124 },
        { month: "Mar", pickups: 12, carbon: 186 }
      ],
      users: [],
      submissions: [],
      pickups: []
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete('/api/admin/users/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    // Suppress deletion of admins or handle securely
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// --- CHATBOT ASSISTANT ---

app.post('/api/chatbot/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI assistant for EcoTrack AI, a platform for e-waste recycling. Answer this query concisely (2-4 sentences): ${message}`;
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.json({ reply: "I'm currently unable to connect to my AI core, but I can help you schedule a pickup or scan a device from the dashboard!" });
  }
});

// --- REWARDS LEADERBOARD ---

app.get('/api/rewards/leaderboard', authenticate, async (req, res) => {
  try {
    res.json({
      leaderboard: [
        { full_name: "Aman Prasad Das", eco_points: 950, avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=aman", rank: 1 },
        { full_name: "Green Warrior", eco_points: 800, avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=warrior", rank: 2 },
        { full_name: req.user.user_metadata?.full_name || req.user.email.split('@')[0], eco_points: 150, avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${req.user.email}`, is_current: true, rank: 3 }
      ],
      user_rank: 3,
      user_points: 150
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = app;
