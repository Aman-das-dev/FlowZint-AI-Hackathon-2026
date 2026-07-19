const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'backend', 'ecotrack.db.json');

// Ensure parent directories exist
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const RECYCLERS_LIST = [
  {
    id: 1,
    name: "EcoRecycle India Hub",
    address: "Block 4, Outer Ring Road, Manyata Tech Park, Bengaluru, Karnataka 560045",
    latitude: 12.9716,
    longitude: 77.5946,
    pickup_available: true,
    rating: 4.8,
    contact_phone: "+91 80 2364 8876",
    working_hours: "09:00 AM - 06:00 PM",
    accepted_categories: ["Computers", "Displays", "Mobile Devices", "Accessories"]
  },
  {
    id: 2,
    name: "Croma E-Waste Collection Point",
    address: "Linking Road, Santacruz West, Mumbai, Maharashtra 400054",
    latitude: 19.0760,
    longitude: 72.8777,
    pickup_available: true,
    rating: 4.6,
    contact_phone: "+91 22 6699 9921",
    working_hours: "10:00 AM - 08:00 PM",
    accepted_categories: ["Computers", "Accessories", "Networking", "Batteries"]
  },
  {
    id: 3,
    name: "Delhi E-Waste Management Facility",
    address: "Okhla Industrial Area Phase 3, New Delhi, Delhi 110020",
    latitude: 28.6139,
    longitude: 77.2090,
    pickup_available: true,
    rating: 4.5,
    contact_phone: "+91 11 4160 9876",
    working_hours: "09:00 AM - 05:30 PM",
    accepted_categories: ["Mobile Devices", "Displays", "Wearables", "Batteries"]
  },
  {
    id: 4,
    name: "Hyderabad Green Planet Recyclers",
    address: "HITEC City Phase 2, Madhapur, Hyderabad, Telangana 500081",
    latitude: 17.3850,
    longitude: 78.4867,
    pickup_available: false,
    rating: 4.5,
    contact_phone: "+91 40 9123 3211",
    working_hours: "08:00 AM - 06:00 PM",
    accepted_categories: ["Computers", "Peripherals", "Displays", "Batteries"]
  },
  {
    id: 5,
    name: "Chennai E-Disposal & Recovery Hub",
    address: "Rajiv Gandhi Salai, IT Corridor, Sholinganallur, Chennai, Tamil Nadu 600119",
    latitude: 13.0827,
    longitude: 80.2707,
    pickup_available: true,
    rating: 4.7,
    contact_phone: "+91 44 2450 1199",
    working_hours: "09:00 AM - 06:00 PM",
    accepted_categories: ["Computers", "Displays", "Networking", "Accessories"]
  },
  {
    id: 6,
    name: "Pune CleanTech Recyclers",
    address: "Hinjawadi Phase 1, Infotech Park, Pune, Maharashtra 411057",
    latitude: 18.5204,
    longitude: 73.8567,
    pickup_available: true,
    rating: 4.6,
    contact_phone: "+91 20 6710 4400",
    working_hours: "09:30 AM - 06:30 PM",
    accepted_categories: ["Mobile Devices", "Displays", "Wearables", "Batteries"]
  },
  {
    id: 7,
    name: "Kolkata Eco-Scrap Recovery Systems",
    address: "Salt Lake Sector V, Electronics Complex, Kolkata, West Bengal 700091",
    latitude: 22.5726,
    longitude: 88.3639,
    pickup_available: false,
    rating: 4.4,
    contact_phone: "+91 33 2357 5566",
    working_hours: "10:00 AM - 05:30 PM",
    accepted_categories: ["Computers", "Accessories", "Networking", "Peripherals"]
  }
];

function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  
  // Default accounts
  const adminPasswordHash = bcrypt.hashSync('adminpassword123', salt);
  const demoPasswordHash = bcrypt.hashSync('demopassword123', salt);
  const recoveryCodeHash = bcrypt.hashSync('ECO-RECOVER-123456', salt);

  const initialUsers = [
    {
      id: "admin-user-id",
      email: "amanprasaddas5@gmail.com",
      password_hash: adminPasswordHash,
      plain_password: "adminpassword123",
      full_name: "Aman Prasad Das",
      phone_number: "+919876543210",
      avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=aman",
      eco_points: 950,
      created_at: new Date().toISOString(),
      recovery_code_hash: recoveryCodeHash
    },
    {
      id: "demo-user-id",
      email: "demo@ecotrack.ai",
      password_hash: demoPasswordHash,
      plain_password: "demopassword123",
      full_name: "Eco Demo User",
      phone_number: "+910000000000",
      avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=demo",
      eco_points: 150,
      created_at: new Date().toISOString(),
      recovery_code_hash: null
    }
  ];

  const initialAchievements = [
    {
      id: 1,
      user_id: "admin-user-id",
      badge_name: "Green Recruit",
      description: "Joined EcoTrack AI to save the planet!",
      earned_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: "admin-user-id",
      badge_name: "Eco Scout",
      description: "Successfully scheduled a pickup location.",
      earned_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: "demo-user-id",
      badge_name: "Green Recruit",
      description: "Joined EcoTrack AI to save the planet!",
      earned_at: new Date().toISOString()
    }
  ];

  const initialSubmissions = [
    {
      id: 101,
      user_id: "admin-user-id",
      device_name: "iPhone 12 Pro",
      category: "Mobile Devices",
      confidence: 0.98,
      hazard_level: "High (Lithium Battery, Lead, Flame Retardants)",
      estimated_life_months: 18,
      market_val: 150.0,
      recycling_val: 12.0,
      repair_val: 45.0,
      scrap_val: 5.5,
      ai_explanation: "This smartphone contains precious materials like gold, silver, copper, and palladium, alongside hazardous elements such as lithium in the battery.",
      image_url: "https://api.dicebear.com/7.x/bottts/svg?seed=iphone12",
      submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    },
    {
      id: 102,
      user_id: "admin-user-id",
      device_name: "Dell XPS 15",
      category: "Computers",
      confidence: 0.96,
      hazard_level: "High (Lithium Battery, Mercury in older screens)",
      estimated_life_months: 24,
      market_val: 350.0,
      recycling_val: 28.0,
      repair_val: 120.0,
      scrap_val: 15.0,
      ai_explanation: "Laptops contain highly reusable circuit boards, screens, RAM, and storage modules. The battery poses a high hazard.",
      image_url: "https://api.dicebear.com/7.x/bottts/svg?seed=dellxps",
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    }
  ];

  const initialPickups = [
    {
      id: 501,
      user_id: "admin-user-id",
      recycler_name: "EcoRecycle India Hub",
      recycler_address: "Block 4, Outer Ring Road, Manyata Tech Park, Bengaluru, Karnataka 560045",
      pickup_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days later
      pickup_time: "10:30 AM",
      address: "123 Green Street, Bengaluru",
      contact_phone: "+91 99999 88888",
      status: "Driver Assigned",
      driver_name: "Ramesh Kumar",
      driver_phone: "+91 98123 45678",
      created_at: new Date().toISOString()
    }
  ];

  return {
    users: initialUsers,
    otp_codes: [],
    device_submissions: initialSubmissions,
    pickup_schedules: initialPickups,
    achievements: initialAchievements
  };
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = getInitialData();
      saveDB(initialData);
      return initialData;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    const initialData = getInitialData();
    saveDB(initialData);
    return initialData;
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

const db = {
  // Users
  getUserByEmail(email) {
    const data = loadDB();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id) {
    const data = loadDB();
    return data.users.find(u => u.id === id);
  },

  createUser(user) {
    const data = loadDB();
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: user.email,
      password_hash: bcrypt.hashSync(user.password, 10),
      plain_password: user.password,
      full_name: user.full_name,
      phone_number: user.phone_number || null,
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
      eco_points: 100,
      created_at: new Date().toISOString(),
      recovery_code_hash: user.recovery_code_hash || null
    };
    data.users.push(newUser);
    saveDB(data);
    return newUser;
  },

  updateUser(id, updates) {
    const data = loadDB();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates };
      saveDB(data);
      return data.users[idx];
    }
    return null;
  },

  deleteUser(id) {
    const data = loadDB();
    data.users = data.users.filter(u => u.id !== id);
    data.device_submissions = data.device_submissions.filter(s => s.user_id !== id);
    data.pickup_schedules = data.pickup_schedules.filter(p => p.user_id !== id);
    data.achievements = data.achievements.filter(a => a.user_id !== id);
    saveDB(data);
  },

  getAllUsers() {
    const data = loadDB();
    return data.users;
  },

  // OTP
  getOtp(phoneOrEmail) {
    const data = loadDB();
    return data.otp_codes.find(o => o.phone_or_email.toLowerCase() === phoneOrEmail.toLowerCase());
  },

  saveOtp(phoneOrEmail, otp, expiresAt) {
    const data = loadDB();
    data.otp_codes = data.otp_codes.filter(o => o.phone_or_email.toLowerCase() !== phoneOrEmail.toLowerCase());
    data.otp_codes.push({
      phone_or_email: phoneOrEmail,
      otp_code: otp,
      expires_at: expiresAt
    });
    saveDB(data);
  },

  deleteOtp(phoneOrEmail) {
    const data = loadDB();
    data.otp_codes = data.otp_codes.filter(o => o.phone_or_email.toLowerCase() !== phoneOrEmail.toLowerCase());
    saveDB(data);
  },

  // Device Submissions
  getDeviceSubmissions(userId) {
    const data = loadDB();
    return data.device_submissions.filter(s => s.user_id === userId);
  },

  addDeviceSubmission(userId, submission) {
    const data = loadDB();
    const newSubmission = {
      id: Date.now(),
      user_id: userId,
      device_name: submission.device_name,
      category: submission.category,
      confidence: submission.confidence || 0.92,
      hazard_level: submission.hazard_level || "Medium",
      estimated_life_months: submission.estimated_life_months || 12,
      market_val: submission.market_val || 0.0,
      recycling_val: submission.recycling_val || 0.0,
      repair_val: submission.repair_val || 0.0,
      scrap_val: submission.scrap_val || 0.0,
      ai_explanation: submission.ai_explanation || null,
      image_url: submission.image_url || null,
      submitted_at: new Date().toISOString()
    };
    data.device_submissions.push(newSubmission);
    saveDB(data);
    return newSubmission;
  },

  clearDeviceSubmissions(userId) {
    const data = loadDB();
    data.device_submissions = data.device_submissions.filter(s => s.user_id !== userId);
    saveDB(data);
  },

  getAllDeviceSubmissions() {
    const data = loadDB();
    return data.device_submissions;
  },

  // Pickups
  getPickupSchedules(userId) {
    const data = loadDB();
    return data.pickup_schedules.filter(p => p.user_id === userId);
  },

  addPickupSchedule(userId, pickup) {
    const data = loadDB();
    const newPickup = {
      id: Date.now(),
      user_id: userId,
      recycler_name: pickup.recycler_name,
      recycler_address: pickup.recycler_address,
      pickup_date: pickup.pickup_date,
      pickup_time: pickup.pickup_time,
      address: pickup.address,
      contact_phone: pickup.contact_phone,
      status: pickup.status || "Pending",
      driver_name: pickup.driver_name || null,
      driver_phone: pickup.driver_phone || null,
      created_at: new Date().toISOString()
    };
    data.pickup_schedules.push(newPickup);
    saveDB(data);
    return newPickup;
  },

  updatePickupStatus(pickupId, status, updates = {}) {
    const data = loadDB();
    const idx = data.pickup_schedules.findIndex(p => p.id === Number(pickupId));
    if (idx !== -1) {
      data.pickup_schedules[idx] = { ...data.pickup_schedules[idx], status, ...updates };
      saveDB(data);
      return data.pickup_schedules[idx];
    }
    return null;
  },

  getAllPickupSchedules() {
    const data = loadDB();
    return data.pickup_schedules;
  },

  // Achievements
  getAchievements(userId) {
    const data = loadDB();
    return data.achievements.filter(a => a.user_id === userId);
  },

  addAchievement(userId, badgeName, description) {
    const data = loadDB();
    const newAchievement = {
      id: Date.now() + Math.floor(Math.random() * 100),
      user_id: userId,
      badge_name: badgeName,
      description: description,
      earned_at: new Date().toISOString()
    };
    data.achievements.push(newAchievement);
    saveDB(data);
    return newAchievement;
  },

  // Recyclers list
  getRecyclers() {
    return RECYCLERS_LIST;
  }
};

module.exports = db;
