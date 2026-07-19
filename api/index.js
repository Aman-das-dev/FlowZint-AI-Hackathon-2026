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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
};

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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/devices/detect', authenticate, async (req, res) => {
  // Mock detection for Vercel since uploading files via Multer on serverless is tricky
  res.json({
    id: Date.now(),
    device_type: "Smartphone",
    brand: "Generic",
    model: "X-100",
    condition: "Good",
    estimated_age_years: 2,
    recycling_val: 15.50,
    eco_points_awarded: 50,
    hazard_level: "Low",
    recyclability_score: 85,
    user_id: req.user.id,
    created_at: new Date().toISOString()
  });
});

app.get('/api/recyclers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('recyclers').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pickups', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pickup_schedules')
      .select('*, recyclers(*)')
      .eq('user_id', req.user.id)
      .order('scheduled_date', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pickups', authenticate, async (req, res) => {
  try {
    const { recycler_id, scheduled_date, address, items, notes } = req.body;
    const { data, error } = await supabase
      .from('pickup_schedules')
      .insert({
        user_id: req.user.id,
        recycler_id,
        scheduled_date,
        address,
        items: items || [],
        notes: notes || '',
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI assistant for EcoTrack AI, a platform for e-waste recycling. Answer this query concisely: ${message}`;
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.json({ reply: "I'm currently unable to connect to my AI core, but I can help you schedule a pickup or scan a device from the dashboard!" });
  }
});

module.exports = app;
