import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
from supabase import create_client, Client
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt
import jwt
import google.generativeai as genai

# Setup FastAPI App
app = FastAPI(title="EcoTrack AI API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoTrack AI Backend API", "status": "running"}

# Database Setup (Supports SQLite and PostgreSQL)
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./ecotrack.db")

# Auto-correct legacy postgres:// schemas to postgresql:// for SQLAlchemy compatibility
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        with engine.connect() as conn:
            pass
    else:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            pass
except Exception as e:
    print("\n" + "="*80)
    print(f"WARNING: Failed to connect to database at: {DATABASE_URL}")
    print(f"DATABASE ERROR: {e}")
    print("EcoTrack AI will automatically fall back to SQLite: sqlite:///./ecotrack.db")
    print("="*80 + "\n")
    DATABASE_URL = "sqlite:///./ecotrack.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Configure Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        # Check if key is a placeholder or obfuscated, if so skip initialization or handle gracefully
        if "••••" in SUPABASE_KEY or not SUPABASE_KEY:
            print("Supabase key is a placeholder. Supabase integration running in fallback mode.")
        else:
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("Supabase client initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
else:
    print("Supabase URL or Key not found in environment. Supabase integration disabled.")

# Security & JWT Configurations
SECRET_KEY = os.environ.get("JWT_SECRET", "ecotrack_secret_key_2026")
ALGORITHM = "HS256"

# Configure Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API configured successfully.")
else:
    print("Gemini API key not found. Using local simulated AI engine.")

# --- Database Models ---

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    plain_password = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    avatar_url = Column(String, default="https://api.dicebear.com/7.x/bottts/svg?seed=ecotrack")
    eco_points = Column(Integer, default=100) # Base 100 points
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    recovery_code_hash = Column(String, nullable=True)  # Bcrypt-hashed recovery code for password reset

class OTPCodeDB(Base):
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True, index=True)
    phone_or_email = Column(String, unique=True, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

class DeviceSubmissionDB(Base):
    __tablename__ = "device_submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    device_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    confidence = Column(Float, default=0.92)
    hazard_level = Column(String, default="Medium")
    estimated_life_months = Column(Integer, default=12)
    market_val = Column(Float, default=0.0)
    recycling_val = Column(Float, default=0.0)
    repair_val = Column(Float, default=0.0)
    scrap_val = Column(Float, default=0.0)
    ai_explanation = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

class PickupScheduleDB(Base):
    __tablename__ = "pickup_schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    recycler_name = Column(String, nullable=False)
    recycler_address = Column(String, nullable=False)
    pickup_date = Column(String, nullable=False)
    pickup_time = Column(String, nullable=False)
    address = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, Accepted, Driver Assigned, Picked Up, Completed
    driver_name = Column(String, nullable=True)
    driver_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AchievementDB(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dynamically add new columns if they do not exist (SQLite/PostgreSQL migration support)
try:
    with engine.begin() as conn:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        columns = inspector.get_columns('users')
        column_names = [c['name'] for c in columns]
        if 'plain_password' not in column_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN plain_password VARCHAR(255)"))
            print("Successfully added plain_password column to users table.")
        if 'recovery_code_hash' not in column_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN recovery_code_hash VARCHAR(255)"))
            print("Successfully added recovery_code_hash column to users table.")
except Exception as e:
    print(f"Note: column migration log: {e}")

# --- Dependency Injection for DB ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class RecoverAccount(BaseModel):
    email: EmailStr
    recovery_code: str
    new_password: str

class OTPRequest(BaseModel):
    phone_or_email: str

class OTPVerify(BaseModel):
    phone_or_email: str
    otp_code: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class PickupCreate(BaseModel):
    recycler_name: str
    recycler_address: str
    pickup_date: str
    pickup_time: str
    address: str
    contact_phone: str

class ChatQuery(BaseModel):
    message: str

# --- Helper Functions ---
import random
import string

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def generate_recovery_code() -> str:
    """Generate a readable 12-character recovery code in format ECO-XXXX-XXXX"""
    chars = string.ascii_uppercase + string.digits
    part1 = ''.join(random.choices(chars, k=4))
    part2 = ''.join(random.choices(chars, k=4))
    return f"ECO-{part1}-{part2}"

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str, db: Session = Depends(get_db)) -> UserDB:
    # 1. Try local JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email:
            user = db.query(UserDB).filter(UserDB.email == email).first()
            if user:
                return user
    except Exception:
        pass

    # 2. Try Supabase JWT
    if supabase:
        try:
            res = supabase.auth.get_user(token)
            if res and res.user:
                email = res.user.email
                user = db.query(UserDB).filter(UserDB.email == email).first()
                if not user:
                    user = UserDB(
                        email=email,
                        full_name=res.user.user_metadata.get("full_name") or email.split("@")[0].capitalize(),
                        password_hash=get_password_hash(str(uuid.uuid4())),
                        plain_password="Supabase Authenticated",
                        eco_points=100
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                    
                    init_achievement = AchievementDB(
                        user_id=user.id,
                        badge_name="Eco Scout",
                        description="Joined EcoTrack AI via Supabase Cloud Auth!"
                    )
                    db.add(init_achievement)
                    db.commit()
                return user
        except Exception as sb_err:
            print(f"Supabase auth error: {sb_err}")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

# Helper to verify auth header directly
def get_current_user_from_header(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> UserDB:
    if not authorization:
        # Fallback to anonymous user for easy hackathon demo if no token is provided
        demo_user = db.query(UserDB).filter(UserDB.email == "demo@ecotrack.ai").first()
        if not demo_user:
            demo_user = UserDB(
                email="demo@ecotrack.ai",
                password_hash=get_password_hash("demopassword"),
                plain_password="demopassword",
                full_name="Eco Citizen",
                eco_points=120
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user
        
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        
        # 1. Try local JWT
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            user = db.query(UserDB).filter(UserDB.email == email).first()
            if user:
                return user
        except Exception:
            pass

        # 2. Try Supabase JWT
        if supabase:
            try:
                res = supabase.auth.get_user(token)
                if res and res.user:
                    email = res.user.email
                    user = db.query(UserDB).filter(UserDB.email == email).first()
                    if not user:
                        user = UserDB(
                            email=email,
                            full_name=res.user.user_metadata.get("full_name") or email.split("@")[0].capitalize(),
                            password_hash=get_password_hash(str(uuid.uuid4())),
                            plain_password="Supabase Authenticated",
                            eco_points=100
                        )
                        db.add(user)
                        db.commit()
                        db.refresh(user)
                        
                        init_achievement = AchievementDB(
                            user_id=user.id,
                            badge_name="Eco Scout",
                            description="Joined EcoTrack AI via Supabase Cloud Auth!"
                        )
                        db.add(init_achievement)
                        db.commit()
                    return user
            except Exception:
                pass
    except Exception:
        pass
    
    # Return demo user instead of failing hard (good for hackathon demo resilience)
    demo_user = db.query(UserDB).filter(UserDB.email == "demo@ecotrack.ai").first()
    if not demo_user:
        demo_user = UserDB(
            email="demo@ecotrack.ai",
            password_hash=get_password_hash("demopassword"),
            plain_password="demopassword",
            full_name="Eco Citizen",
            eco_points=120
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    return demo_user

# --- Authentication Routes ---

@app.post("/api/auth/register")
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate a one-time recovery code and store its bcrypt hash
    plain_recovery_code = generate_recovery_code()
    hashed_recovery_code = get_password_hash(plain_recovery_code)
    
    new_user = UserDB(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        plain_password=user_in.password,
        full_name=user_in.full_name,
        recovery_code_hash=hashed_recovery_code
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create base achievements
    init_achievement = AchievementDB(
        user_id=new_user.id,
        badge_name="Green Recruit",
        description="Joined EcoTrack AI to save the planet!"
    )
    db.add(init_achievement)
    db.commit()
    
    token = create_access_token({"sub": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "recovery_code": plain_recovery_code,  # Shown ONCE to the user
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "avatar_url": new_user.avatar_url,
            "eco_points": new_user.eco_points
        }
    }

@app.post("/api/auth/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "eco_points": user.eco_points
        }
    }

@app.post("/api/auth/google", response_model=Token)
def google_login(google_in: GoogleAuth, db: Session = Depends(get_db)):
    email = google_in.email
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for Google login")
        
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if not user:
        full_name = google_in.full_name or email.split("@")[0].capitalize()
        avatar_url = google_in.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={email}"
        user = UserDB(
            email=email,
            password_hash=get_password_hash(str(uuid.uuid4())),
            plain_password="Google Authenticated",
            full_name=full_name,
            avatar_url=avatar_url,
            eco_points=150
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        init_achievement = AchievementDB(
            user_id=user.id,
            badge_name="Google Recycler",
            description="Signed in using Google Account!"
        )
        db.add(init_achievement)
        db.commit()

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "eco_points": user.eco_points
        }
    }

@app.post("/api/auth/recover")
def recover_account(body: RecoverAccount, db: Session = Depends(get_db)):
    """Allow a user to reset their password using their email + recovery code."""
    user = db.query(UserDB).filter(UserDB.email == body.email).first()
    if not user or not user.recovery_code_hash:
        raise HTTPException(status_code=400, detail="No account found or no recovery code set for this email.")

    # Verify the provided recovery code against the stored hash
    if not verify_password(body.recovery_code, user.recovery_code_hash):
        raise HTTPException(status_code=400, detail="Invalid recovery code. Please check the code you saved and try again.")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    # Update the password (hash it) and invalidate the recovery code
    user.password_hash = get_password_hash(body.new_password)
    user.plain_password = body.new_password
    user.recovery_code_hash = None  # Invalidate recovery code after use
    db.commit()

    return {"message": "Password reset successful. You can now log in with your new password."}

import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_smtp_email(to_email: str, subject: str, html_content: str):
    host = os.environ.get("EMAIL_SERVER_HOST")
    port_str = os.environ.get("EMAIL_SERVER_PORT", "587")
    user = os.environ.get("EMAIL_SERVER_USER")
    password = os.environ.get("EMAIL_SERVER_PASSWORD")
    sender = os.environ.get("EMAIL_FROM", "noreply@ecotrack.ai")
    
    if not host or not user or not password:
        print(f"[SMTP MOCK] SMTP configuration not set. Cannot send to {to_email}.")
        return False
        
    try:
        port = int(port_str)
        msg = MIMEMultipart()
        msg["From"] = sender
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_content, "html"))
        
        if port == 465:
            server = smtplib.SMTP_SSL(host, port)
        else:
            server = smtplib.SMTP(host, port)
            server.starttls()
            
        server.login(user, password)
        server.sendmail(sender, to_email, msg.as_string())
        server.quit()
        print(f"[SMTP] Email sent to {to_email}.")
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email: {e}")
        return False

def send_otp_to_destination(destination: str, code: str) -> bool:
    is_email = "@" in destination
    if is_email:
        subject = "Your EcoTrack AI Authentication Code"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">🌱</span>
                <h2 style="color: #38523A; margin: 5px 0;">EcoTrack AI</h2>
            </div>
            <p>Hello,</p>
            <p>You requested a one-time verification code to access your account. Please use the following 6-digit code:</p>
            <div style="background-color: #f7f9f6; border: 1px dashed #84B056; border-radius: 8px; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #38523A; margin: 20px 0;">
                {code}
            </div>
            <p style="font-size: 12px; color: #888888;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        </div>
        """
        return send_smtp_email(destination, subject, html_content)
    else:
        body = f"Your EcoTrack AI verification code is: {code}. Valid for 5 minutes."
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        verify_service_sid = os.environ.get("TWILIO_VERIFY_SERVICE_SID")
        
        if account_sid and auth_token:
            try:
                if verify_service_sid:
                    from twilio.rest import Client
                    client = Client(account_sid, auth_token)
                    client.verify.v2.services(verify_service_sid).verifications.create(to=destination, channel="sms")
                    print(f"[TWILIO VERIFY] Verification SMS sent to {destination}")
                    return True
                else:
                    from_num = os.environ.get("TWILIO_PHONE_NUMBER") or os.environ.get("TWILIO_FROM_NUMBER")
                    if from_num:
                        from twilio.rest import Client
                        client = Client(account_sid, auth_token)
                        client.messages.create(body=body, from_=from_num, to=destination)
                        print(f"[TWILIO SMS] Verification SMS sent to {destination} from {from_num}")
                        return True
            except Exception as e:
                print(f"[TWILIO ERROR] Failed to send SMS via Twilio: {e}")
                
        print(f"[SMS MOCK] Verification code for {destination} is: {code}")
        return False

@app.post("/api/auth/otp/send")
def send_otp(body: OTPRequest, db: Session = Depends(get_db)):
    destination = body.phone_or_email.strip()
    if not destination:
        raise HTTPException(status_code=400, detail="Phone or email is required")
        
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    
    otp_record = db.query(OTPCodeDB).filter(OTPCodeDB.phone_or_email == destination).first()
    if otp_record:
        otp_record.otp_code = code
        otp_record.expires_at = expires_at
    else:
        otp_record = OTPCodeDB(phone_or_email=destination, otp_code=code, expires_at=expires_at)
        db.add(otp_record)
        
    db.commit()
    
    sent_successfully = send_otp_to_destination(destination, code)
    
    return {
        "success": True,
        "message": f"OTP verification code sent to {destination}.",
        "dev_otp": code if not sent_successfully or os.environ.get("NODE_ENV") != "production" else None
    }

@app.post("/api/auth/otp/verify", response_model=Token)
def verify_otp(body: OTPVerify, db: Session = Depends(get_db)):
    destination = body.phone_or_email.strip()
    code = body.otp_code.strip()
    
    if not destination or not code:
        raise HTTPException(status_code=400, detail="Phone/email and OTP code are required")
        
    otp_record = db.query(OTPCodeDB).filter(
        OTPCodeDB.phone_or_email == destination,
        OTPCodeDB.otp_code == code
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please try again.")
        
    if datetime.datetime.utcnow() > otp_record.expires_at:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new one.")
        
    db.delete(otp_record)
    db.commit()
    
    is_email = "@" in destination
    user = None
    if is_email:
        user = db.query(UserDB).filter(UserDB.email == destination).first()
    else:
        user = db.query(UserDB).filter(UserDB.phone_number == destination).first()
        
    if not user:
        full_name = body.full_name or "Eco User"
        if is_email:
            email_val = destination
            phone_val = None
        else:
            email_val = f"phone_{destination.replace('+', '')}@ecotrack.ai"
            phone_val = destination
            
        user = UserDB(
            email=email_val,
            phone_number=phone_val,
            password_hash=get_password_hash(str(uuid.uuid4())),
            plain_password="OTP Authenticated",
            full_name=full_name,
            avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={destination}",
            eco_points=150
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        init_achievement = AchievementDB(
            user_id=user.id,
            badge_name="OTP Recycler",
            description="Signed in using OTP Verification!"
        )
        db.add(init_achievement)
        db.commit()
        
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "eco_points": user.eco_points
        }
    }

@app.get("/api/auth/me")
def get_me(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    achievements = db.query(AchievementDB).filter(AchievementDB.user_id == user.id).all()
    submissions = db.query(DeviceSubmissionDB).filter(DeviceSubmissionDB.user_id == user.id).all()
    pickups = db.query(PickupScheduleDB).filter(PickupScheduleDB.user_id == user.id).all()
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "eco_points": user.eco_points
        },
        "achievements": [
            {"badge_name": a.badge_name, "description": a.description, "earned_at": a.earned_at}
            for a in achievements
        ],
        "stats": {
            "total_recycled": len(submissions),
            "pickups_scheduled": len(pickups)
        }
    }

# --- AI Device Identification & Pricing ---

DEVICE_DATASET = {
    "smartphone": {
        "category": "Mobile Devices",
        "hazard_level": "High (Lithium Battery, Lead, Flame Retardants)",
        "estimated_life_months": 18,
        "market_val": 150.0,
        "recycling_val": 12.0,
        "repair_val": 45.0,
        "scrap_val": 5.50,
        "explanation": "This is a smartphone. It contains precious materials like gold, silver, copper, and palladium, alongside hazardous elements such as lithium in the battery and brominated flame retardants in the casing. Proper dismantling is required to recover metals and safely neutralize the lithium battery."
    },
    "laptop": {
        "category": "Computers",
        "hazard_level": "High (Lithium Battery, Mercury in older screens)",
        "estimated_life_months": 24,
        "market_val": 350.0,
        "recycling_val": 28.0,
        "repair_val": 120.0,
        "scrap_val": 15.0,
        "explanation": "Laptops contain highly reusable circuit boards, screens, RAM, and storage modules. The battery poses a high hazard. Recycling centers extract metals, reuse functional chips, and shred plastics to prevent toxic landfill leaching."
    },
    "charger": {
        "category": "Accessories",
        "hazard_level": "Low (Copper wiring, Plastic casing)",
        "estimated_life_months": 6,
        "market_val": 15.0,
        "recycling_val": 1.50,
        "repair_val": 3.00,
        "scrap_val": 0.80,
        "explanation": "Chargers and power bricks consist primarily of copper wiring and thermoplastic shells. Copper is 100% recyclable, but PVC casings can emit toxic gases if burned, making certified mechanical shredding essential."
    },
    "battery": {
        "category": "Batteries",
        "hazard_level": "Critical (Lithium, Cobalt, Nickel, Corrosive electrolyte)",
        "estimated_life_months": 3,
        "market_val": 5.0,
        "recycling_val": 0.50,
        "repair_val": 0.00,
        "scrap_val": 0.20,
        "explanation": "Lithium/alkaline batteries are classified as critical hazards. If damaged, they can self-heat and cause fires. Certified recyclers use pyrometallurgical or hydrometallurgical processing to recover cobalt, lithium, and nickel."
    },
    "monitor": {
        "category": "Displays",
        "hazard_level": "High (Mercury, Lead glass, Cadmium)",
        "estimated_life_months": 36,
        "market_val": 110.0,
        "recycling_val": 8.00,
        "repair_val": 35.00,
        "scrap_val": 3.20,
        "explanation": "Monitors contain leaded glass in CRTs or mercury in older LCD CCFL backlights. High voltage capacitors and plastic casing must be handled with care. Proper mechanical sorting isolates toxic phosphor powders."
    },
    "keyboard": {
        "category": "Accessories",
        "hazard_level": "Low (Plastic ABS, Silicon, traces of copper)",
        "estimated_life_months": 12,
        "market_val": 20.0,
        "recycling_val": 1.00,
        "repair_val": 4.00,
        "scrap_val": 0.30,
        "explanation": "Keyboards contain mechanical/silicone membrane switches, ABS plastic, and a small circuit board. The plastic is separated by polymer type, shredded, and pelletized for industrial reuse."
    },
    "mouse": {
        "category": "Accessories",
        "hazard_level": "Low (Plastic ABS, small PCB)",
        "estimated_life_months": 12,
        "market_val": 15.0,
        "recycling_val": 0.80,
        "repair_val": 2.00,
        "scrap_val": 0.20,
        "explanation": "Computer mice are low hazard. They contain ABS plastics, optical sensors, and copper cables. They are shredded mechanically to separate plastic granules and metallic particles."
    },
    "desktop": {
        "category": "Computers",
        "hazard_level": "Medium (Capacitors, flame retardants, lead solder)",
        "estimated_life_months": 48,
        "market_val": 450.0,
        "recycling_val": 40.00,
        "repair_val": 150.00,
        "scrap_val": 25.00,
        "explanation": "Desktop computers are high-value recycling targets due to heavy metal components and high-grade PCBs containing gold, silver, and copper. Metal chassis can be melted directly into steel/aluminum streams."
    },
    "printer": {
        "category": "Peripherals",
        "hazard_level": "Medium (Toner powder residue, mechanical components)",
        "estimated_life_months": 24,
        "market_val": 80.0,
        "recycling_val": 5.00,
        "repair_val": 25.00,
        "scrap_val": 2.50,
        "explanation": "Printers are mechanical assemblies with rollers, motors, and glass scanners. Toner cartridge residue is micro-toxic. Recyclers isolate ink drums to prevent air pollution during plastics processing."
    },
    "television": {
        "category": "Displays",
        "hazard_level": "High (Lead in CRT, mercury in LCD, flame retardants)",
        "estimated_life_months": 40,
        "market_val": 200.0,
        "recycling_val": 15.00,
        "repair_val": 60.00,
        "scrap_val": 6.00,
        "explanation": "Televisions contain complex power boards, high-grade plastic casings, and glass panels. Proper treatment separates the panel glass from internal electronics to recover precious metal connectors."
    },
    "router": {
        "category": "Networking",
        "hazard_level": "Low (PCB boards, PVC plastic)",
        "estimated_life_months": 18,
        "market_val": 40.0,
        "recycling_val": 3.00,
        "repair_val": 10.00,
        "scrap_val": 1.20,
        "explanation": "Routers have compact circuit boards containing valuable high-frequency semiconductor components. PVC housings are separated and copper antennas are harvested for copper smelting."
    },
    "earphones": {
        "category": "Accessories",
        "hazard_level": "Low (Copper coils, NdFeB magnets, PVC/silicone)",
        "estimated_life_months": 8,
        "market_val": 25.0,
        "recycling_val": 1.00,
        "repair_val": 5.00,
        "scrap_val": 0.40,
        "explanation": "Earphones contain tiny neodymium magnets, copper voice coils, and polyurethane wire jackets. Due to their small size, they are typically processed in bulk copper and precious metal shredders."
    },
    "tablet": {
        "category": "Mobile Devices",
        "hazard_level": "High (Lithium Battery, LCD screen)",
        "estimated_life_months": 20,
        "market_val": 180.0,
        "recycling_val": 15.00,
        "repair_val": 50.00,
        "scrap_val": 6.20,
        "explanation": "Tablets, similar to smartphones, carry critical hazards due to tightly integrated lithium batteries and glass-to-casing adhesives. Specialists heat the assembly to extract the lithium battery safely before recycling the frame."
    },
    "smartwatch": {
        "category": "Wearables",
        "hazard_level": "Medium (Tiny battery, sensors, silicone)",
        "estimated_life_months": 12,
        "market_val": 100.0,
        "recycling_val": 8.00,
        "repair_val": 30.00,
        "scrap_val": 2.10,
        "explanation": "Smartwatches have extremely miniature PCBs, micro-lithium batteries, and water-sealed aluminum or stainless steel cases. They require specialized manual tools to extract metals without triggering chemical leaks."
    },
    "battery": {
        "category": "Batteries",
        "hazard_level": "Extreme (Lithium, Acid leak hazard, Cadmium)",
        "estimated_life_months": 6,
        "market_val": 5.0,
        "recycling_val": 1.50,
        "repair_val": 0.00,
        "scrap_val": 0.50,
        "explanation": "Batteries pose critical environmental threats. They contain heavy metals and acids that leak if casing rusts, and lithium-ion cells can short-circuit causing intense chemical landfill fires."
    },
    "keyboard": {
        "category": "Input Devices",
        "hazard_level": "Low (ABS Plastics, copper contacts)",
        "estimated_life_months": 48,
        "market_val": 15.0,
        "recycling_val": 1.00,
        "repair_val": 5.00,
        "scrap_val": 0.30,
        "explanation": "Keyboards are mostly made of recyclable ABS and polycarbonate thermoplastics, with thin copper tracks. Recycling isolates the plastic shell for clean compounding pellet recovery."
    },
    "mouse": {
        "category": "Input Devices",
        "hazard_level": "Low (Plastics, tiny PCB)",
        "estimated_life_months": 36,
        "market_val": 10.0,
        "recycling_val": 0.80,
        "repair_val": 3.00,
        "scrap_val": 0.20,
        "explanation": "Computer mice are processed through bulk electronics shredders. Plastics are separated by flotation tanks, and copper wires/scroll wheels are captured for metal refining."
    },
    "monitor": {
        "category": "Displays",
        "hazard_level": "High (Mercury lamps in older LCDs, leaded glass)",
        "estimated_life_months": 36,
        "market_val": 85.0,
        "recycling_val": 6.00,
        "repair_val": 25.00,
        "scrap_val": 2.50,
        "explanation": "Monitors carry high hazard indices. Glass panels must be separated carefully from internal printed boards, and CCFL mercury tubes require vacuum gas extraction to avoid air pollution."
    },
    "desktop": {
        "category": "Computers",
        "hazard_level": "Medium (Heavy metal solder, steel frame)",
        "estimated_life_months": 48,
        "market_val": 220.0,
        "recycling_val": 22.00,
        "repair_val": 90.00,
        "scrap_val": 15.00,
        "explanation": "Desktop computers are modular and yield high metal recovery. Their heavy sheet-steel chassis is melted down, while RAM, CPU pins, and circuit traces yield gold and palladium."
    },
    "printer": {
        "category": "Office Equipment",
        "hazard_level": "Medium (Toner powder, ink cartridge residues, motors)",
        "estimated_life_months": 36,
        "market_val": 60.0,
        "recycling_val": 4.50,
        "repair_val": 20.00,
        "scrap_val": 1.80,
        "explanation": "Printers contain carcinogenic toner dust and liquid inks. Recycling centers safely extract the ink cartridge and toner assemblies before shredding the remaining metal and plastic housings."
    }
}

@app.post("/api/devices/detect")
async def detect_device(
    file: UploadFile = File(...),
    custom_label: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_header(authorization, db)
    
    # Save the file locally for mock reference
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = f"public/{filename}"
    os.makedirs("public", exist_ok=True)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    image_url = f"http://localhost:8000/public/{filename}"
    
    # Decide which device we are detecting
    # Look at the filename, or standard label sent, or custom label
    search_str = (custom_label or file.filename or "").lower()
    
    detect_key = None
    
    # Try exact match or substring match first
    for key in DEVICE_DATASET.keys():
        if key in search_str:
            detect_key = key
            break
            
    # Synonym matching if no match was found
    if not detect_key:
        if any(term in search_str for term in ["phone", "mobile", "cel", "webcam", "capture", "blob", "image", "jpg", "png", "pic", "photo", "img"]):
            detect_key = "smartphone"
        elif any(term in search_str for term in ["pc", "computer", "tower", "cpu"]):
            detect_key = "desktop"
        elif any(term in search_str for term in ["display", "screen", "lcd", "led"]):
            detect_key = "monitor"
        elif any(term in search_str for term in ["pad", "ipod", "note"]):
            detect_key = "tablet"
        elif any(term in search_str for term in ["wire", "cable", "adapter", "plug"]):
            detect_key = "charger"
            
    # Default fallback to "smartphone" (Mobile Devices) for any other image
    if not detect_key:
        detect_key = "smartphone"

    data = DEVICE_DATASET[detect_key]
    
    # If Gemini is configured, let's call it to get a dynamic and realistic evaluation explanation
    ai_explanation = data["explanation"]
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                f"You are EcoTrack AI. A user uploaded an image of a {detect_key}. "
                f"Provide a 3-4 sentence environmental explanation of: "
                f"1. What hazardous components this {detect_key} contains. "
                f"2. How it should be recycled properly. "
                f"3. Why it shouldn't go to normal landfills. Keep it professional, educational, and sustainable."
            )
            response = model.generate_content(prompt)
            if response.text:
                ai_explanation = response.text.strip()
        except Exception as e:
            print(f"Gemini generation error: {e}, falling back to static text.")

    # Create submission DB record
    submission = DeviceSubmissionDB(
        user_id=current_user.id,
        device_name=detect_key.capitalize(),
        category=data["category"],
        confidence=0.91 + (0.08 * (uuid.uuid4().int % 10) / 10.0), # Random high confidence
        hazard_level=data["hazard_level"],
        estimated_life_months=data["estimated_life_months"],
        market_val=data["market_val"],
        recycling_val=data["recycling_val"],
        repair_val=data["repair_val"],
        scrap_val=data["scrap_val"],
        ai_explanation=ai_explanation,
        image_url=image_url
    )
    db.add(submission)
    
    # Award EcoPoints (e.g. 50 points per device identified)
    current_user.eco_points += 50
    db.add(current_user)
    
    # Award a badge if it is their first device
    first_submission = db.query(DeviceSubmissionDB).filter(DeviceSubmissionDB.user_id == current_user.id).first()
    if not first_submission:
        badge = AchievementDB(
            user_id=current_user.id,
            badge_name="First Scan",
            description="Scanned your first electronic device for recycling!"
        )
        db.add(badge)
        
    db.commit()
    db.refresh(submission)
    
    return {
        "id": submission.id,
        "device_name": submission.device_name,
        "category": submission.category,
        "confidence": round(submission.confidence, 2),
        "hazard_level": submission.hazard_level,
        "estimated_life_months": submission.estimated_life_months,
        "pricing": {
            "market_val": submission.market_val,
            "recycling_val": submission.recycling_val,
            "repair_val": submission.repair_val,
            "scrap_val": submission.scrap_val
        },
        "ai_explanation": submission.ai_explanation,
        "image_url": submission.image_url,
        "submitted_at": submission.submitted_at
    }

@app.get("/api/devices/history")
@app.post("/api/devices/history")
def get_submission_history(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    current_user = get_current_user_from_header(authorization, db)
    submissions = db.query(DeviceSubmissionDB).filter(DeviceSubmissionDB.user_id == current_user.id).order_by(DeviceSubmissionDB.submitted_at.desc()).all()
    return submissions

# --- Certified Recycler Locations ---

RECYCLERS_LIST = [
    {
        "id": 1,
        "name": "EcoRecycle India Hub",
        "address": "Block 4, Outer Ring Road, Manyata Tech Park, Bengaluru, Karnataka 560045",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "pickup_available": True,
        "rating": 4.8,
        "contact_phone": "+91 80 2364 8876",
        "working_hours": "09:00 AM - 06:00 PM",
        "accepted_categories": ["Computers", "Displays", "Mobile Devices", "Accessories"]
    },
    {
        "id": 2,
        "name": "Croma E-Waste Collection Point",
        "address": "Linking Road, Santacruz West, Mumbai, Maharashtra 400054",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "pickup_available": True,
        "rating": 4.6,
        "contact_phone": "+91 22 6699 9921",
        "working_hours": "10:00 AM - 08:00 PM",
        "accepted_categories": ["Computers", "Accessories", "Networking", "Batteries"]
    },
    {
        "id": 3,
        "name": "Delhi E-Waste Management Facility",
        "address": "Okhla Industrial Area Phase 3, New Delhi, Delhi 110020",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "pickup_available": True,
        "rating": 4.9,
        "contact_phone": "+91 11 4160 3211",
        "working_hours": "09:00 AM - 05:00 PM",
        "accepted_categories": ["Mobile Devices", "Displays", "Wearables", "Batteries"]
    },
    {
        "id": 4,
        "name": "Hyderabad Green Planet Recyclers",
        "address": "HITEC City Phase 2, Madhapur, Hyderabad, Telangana 500081",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "pickup_available": False,
        "rating": 4.5,
        "contact_phone": "+91 40 9123 3211",
        "working_hours": "08:00 AM - 06:00 PM",
        "accepted_categories": ["Computers", "Peripherals", "Displays", "Batteries"]
    },
    {
        "id": 5,
        "name": "Chennai E-Disposal & Recovery Hub",
        "address": "Rajiv Gandhi Salai, IT Corridor, Sholinganallur, Chennai, Tamil Nadu 600119",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "pickup_available": True,
        "rating": 4.7,
        "contact_phone": "+91 44 2450 1199",
        "working_hours": "09:00 AM - 06:00 PM",
        "accepted_categories": ["Computers", "Displays", "Networking", "Accessories"]
    },
    {
        "id": 6,
        "name": "Pune CleanTech Recyclers",
        "address": "Hinjawadi Phase 1, Infotech Park, Pune, Maharashtra 411057",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "pickup_available": True,
        "rating": 4.6,
        "contact_phone": "+91 20 6710 4400",
        "working_hours": "09:30 AM - 06:30 PM",
        "accepted_categories": ["Mobile Devices", "Displays", "Wearables", "Batteries"]
    },
    {
        "id": 7,
        "name": "Kolkata Eco-Scrap Recovery Systems",
        "address": "Salt Lake Sector V, Electronics Complex, Kolkata, West Bengal 700091",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "pickup_available": False,
        "rating": 4.4,
        "contact_phone": "+91 33 2357 5566",
        "working_hours": "10:00 AM - 05:30 PM",
        "accepted_categories": ["Computers", "Accessories", "Networking", "Peripherals"]
    }
]

@app.get("/api/recyclers")
def get_recyclers():
    return RECYCLERS_LIST

import time

def advance_pickup_lifecycle(pickup_id: int):
    db = SessionLocal()
    try:
        # Step 1: Wait 5 seconds and advance to 'Accepted'
        time.sleep(5)
        p = db.query(PickupScheduleDB).filter(PickupScheduleDB.id == pickup_id).first()
        if p and p.status == "Pending":
            p.status = "Accepted"
            db.commit()
            print(f"[AUTO-LOGISTICS] Pickup #{pickup_id} advanced to Accepted")

        # Step 2: Wait 6 seconds and advance to 'Driver Assigned'
        time.sleep(6)
        p = db.query(PickupScheduleDB).filter(PickupScheduleDB.id == pickup_id).first()
        if p and p.status == "Accepted":
            p.status = "Driver Assigned"
            db.commit()
            print(f"[AUTO-LOGISTICS] Pickup #{pickup_id} advanced to Driver Assigned")

        # Step 3: Wait 8 seconds and advance to 'Picked Up'
        time.sleep(8)
        p = db.query(PickupScheduleDB).filter(PickupScheduleDB.id == pickup_id).first()
        if p and p.status == "Driver Assigned":
            p.status = "Picked Up"
            db.commit()
            print(f"[AUTO-LOGISTICS] Pickup #{pickup_id} advanced to Picked Up")

        # Step 4: Wait 8 seconds and advance to 'Completed'
        time.sleep(8)
        p = db.query(PickupScheduleDB).filter(PickupScheduleDB.id == pickup_id).first()
        if p and p.status == "Picked Up":
            p.status = "Completed"
            # Award points for completion
            user = db.query(UserDB).filter(UserDB.id == p.user_id).first()
            if user:
                user.eco_points += 200
                db.add(user)
            db.commit()
            print(f"[AUTO-LOGISTICS] Pickup #{pickup_id} advanced to Completed")
    except Exception as e:
        print(f"[AUTO-LOGISTICS ERROR] Failed to auto-advance pickup #{pickup_id}: {e}")
    finally:
        db.close()

# --- Pickup Scheduling ---

@app.post("/api/pickups")
def schedule_pickup(pickup: PickupCreate, background_tasks: BackgroundTasks, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    current_user = get_current_user_from_header(authorization, db)
    
    # Check points reward for scheduling (e.g. 100 EcoPoints)
    current_user.eco_points += 100
    db.add(current_user)
    
    # Award Achievement for Scheduling
    badge = AchievementDB(
        user_id=current_user.id,
        badge_name="Recycling Hero",
        description="Scheduled your first certified e-waste pickup!"
    )
    db.add(badge)
    
    new_pickup = PickupScheduleDB(
        user_id=current_user.id,
        recycler_name=pickup.recycler_name,
        recycler_address=pickup.recycler_address,
        pickup_date=pickup.pickup_date,
        pickup_time=pickup.pickup_time,
        address=pickup.address,
        contact_phone=pickup.contact_phone,
        status="Pending",
        driver_name="Alex Mercer", # Pre-assigned for demo coolness
        driver_phone="+1 (555) 438-1290"
    )
    
    db.add(new_pickup)
    db.commit()
    db.refresh(new_pickup)
    
    # Launch background auto-advancing simulation
    background_tasks.add_task(advance_pickup_lifecycle, new_pickup.id)
    
    return new_pickup

@app.get("/api/pickups")
def get_pickups(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    current_user = get_current_user_from_header(authorization, db)
    pickups = db.query(PickupScheduleDB).filter(PickupScheduleDB.user_id == current_user.id).order_by(PickupScheduleDB.created_at.desc()).all()
    return pickups

@app.post("/api/pickups/{pickup_id}/update-status")
def update_pickup_status(pickup_id: int, status: str, db: Session = Depends(get_db)):
    pickup = db.query(PickupScheduleDB).filter(PickupScheduleDB.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    pickup.status = status
    db.commit()
    return pickup

# --- Environmental & Admin Dashboard Analytics ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Totals across system
    total_users = db.query(UserDB).count()
    total_devices = db.query(DeviceSubmissionDB).count()
    total_pickups = db.query(PickupScheduleDB).count()
    
    # Real-time calculations based on database submissions
    submissions = db.query(DeviceSubmissionDB).all()
    carbon_saved = len(submissions) * 15.5
    water_saved = len(submissions) * 45.0
    trees_eq = carbon_saved * 0.04
    plastic_recycled = len(submissions) * 1.8
    metals_recovered = len(submissions) * 1.2
    
    active_recyclers = len(RECYCLERS_LIST)
    
    # Revenue calculations (estimated)
    revenue_refurbished = len(submissions) * 45.0
    revenue_scrap = len(submissions) * 4.5
    total_revenue = revenue_refurbished + revenue_scrap
    
    # Category statistics for chart (strictly real data)
    categories_count = {
        "Mobile Devices": 0,
        "Computers": 0,
        "Displays": 0,
        "Accessories": 0,
        "Batteries": 0,
        "Networking": 0,
        "Others": 0
    }
    for sub in submissions:
        if sub.category in categories_count:
            categories_count[sub.category] += 1
        else:
            categories_count["Others"] += 1
            
    # Convert dict to chart format
    categories_chart = [{"name": k, "value": v} for k, v in categories_count.items() if v > 0]
    
    # Dynamic historical stats for the last 6 months based on actual DB records
    import calendar
    historical_pickups = []
    today = datetime.datetime.utcnow()
    months_list = []
    for i in range(5, -1, -1):
        yr = today.year
        mo = today.month - i
        while mo <= 0:
            mo += 12
            yr -= 1
        months_list.append((yr, mo))
        
    monthly_data = { (yr, mo): {"pickups": 0, "carbon": 0.0} for yr, mo in months_list }
    
    for p in db.query(PickupScheduleDB).all():
        created = p.created_at or today
        key = (created.year, created.month)
        if key in monthly_data:
            monthly_data[key]["pickups"] += 1
            
    for s in db.query(DeviceSubmissionDB).all():
        submitted = s.submitted_at or today
        key = (submitted.year, submitted.month)
        if key in monthly_data:
            monthly_data[key]["carbon"] += 15.5
            
    for yr, mo in months_list:
        m_name = calendar.month_abbr[mo]
        data = monthly_data[(yr, mo)]
        historical_pickups.append({
            "month": m_name,
            "pickups": data["pickups"],
            "carbon": round(data["carbon"])
        })
    
    # Fetch list of users
    users_list = []
    for u in db.query(UserDB).order_by(UserDB.created_at.desc()).all():
        users_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "password": u.plain_password or ("Hashed: " + u.password_hash[:15] + "..."),
            "eco_points": u.eco_points,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
        
    # Fetch list of device submissions
    submissions_list = []
    for s in db.query(DeviceSubmissionDB).order_by(DeviceSubmissionDB.submitted_at.desc()).all():
        user = db.query(UserDB).filter(UserDB.id == s.user_id).first()
        user_email = user.email if user else "Unknown User"
        submissions_list.append({
            "id": s.id,
            "user_email": user_email,
            "device_name": s.device_name,
            "category": s.category,
            "hazard_level": s.hazard_level,
            "market_val": s.market_val,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None
        })

    return {
        "metrics": {
            "carbon_saved": round(carbon_saved, 1),
            "trees_equivalent": round(trees_eq, 1),
            "water_saved": round(water_saved, 1),
            "plastic_recycled": round(plastic_recycled, 1),
            "metals_recovered": round(metals_recovered, 1),
            "total_devices_recycled": total_devices,
            "total_users": total_users,
            "total_pickups": total_pickups,
            "active_recyclers": active_recyclers,
            "total_revenue": round(total_revenue, 2)
        },
        "device_categories": categories_chart,
        "historical_analytics": historical_pickups,
        "users": users_list,
        "submissions": submissions_list
    }

# --- AI Chatbot Assistant ---

CHATBOT_QA = {
    "lithium": "Lithium-ion batteries are hazardous and should NEVER be thrown in regular trash. When crushed or punctured, they can self-heat and trigger severe toxic chemical fires. In certified recycling centers, they are manually isolated and processed using hydrometallurgy to safely extract and repurpose critical materials like cobalt, lithium, and nickel.",
    
    "battery": "Batteries (including lithium, alkaline, Ni-Cd, and lead-acid) are classified as critical environmental hazards. They contain heavy metals and corrosive acids. You should place them in a small plastic bag or tape their terminals, then drop them at a specialized battery collection bin or schedule a hazardous waste pickup through our locator map.",
    
    "erase": "Before recycling or donating any computer, laptop, or smartphone: \n1. Back up all personal files to cloud/external storage.\n2. Sign out of Apple ID, Google Account, and other synchronized services.\n3. Perform a factory reset.\n4. For maximum security, use drive-wiping tools like DBAN (for older HDDs) or custom built-in secure erase protocols for SSDs to rewrite random data across the drive, rendering historical logs unrecoverable.",
    
    "repair": "Most smartphones and electronics are repairable! If your screen is cracked, your speaker is muffled, or your battery holds less charge, consider visiting a local repair shop or looking up guides on iFixit. Repairing a device extending its life by 1-2 years reduces its carbon footprint by up to 50% compared to recycling it and purchasing a new model.",
    
    "what happens": "Once you submit your e-waste:\n1. **Collection & Sorting**: Devices are sorted into categories.\n2. **Manual Disassembly**: Functional components (RAM, storage, displays) are harvested for resale/refurbishing.\n3. **Hazardous Extraction**: Toxic batteries, mercury bulbs, and lead-glass are isolated.\n4. **Shredding & Sorting**: The remaining materials are mechanically crushed. Plastics, iron, aluminum, and copper are sorted using magnetics, optical systems, and flotation.\n5. **Smelting**: Purified metals are sent to refineries to create new industrial raw materials.",
    
    "recycler": "The best nearby recycler can be found by navigating to our 'Recycler Locator' tab. You'll see certified centers like **EcoSafe Recycling Solutions** and **E-Scrap Solutions Co.** listed on an interactive Leaflet map. Look for the 'Certified R2' or 'e-Stewards' tags which guarantee that no e-waste is illegally exported to developing nations."
}

@app.post("/api/chatbot/chat")
def chatbot_chat(query: ChatQuery):
    msg = query.message.lower()
    
    # If Gemini is configured, query Gemini for a complete, smart, eco-centric response
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                f"You are EcoTrack AI, an intelligent sustainability and e-waste recycling chatbot assistant. "
                f"A user asks: '{query.message}'. "
                f"Provide a helpful, detailed, educational, and encouraging response focused on responsible electronics disposal, recycling standards, and energy conservation. "
                f"Be concise but thorough (2-4 sentences)."
            )
            response = model.generate_content(prompt)
            if response.text:
                return {"reply": response.text.strip()}
        except Exception as e:
            print(f"Gemini chat error: {e}, falling back to static matching.")

    # Local rule-based chatbot fallback
    reply = "I'm EcoTrack AI, your intelligent e-waste recycling assistant. I can answer questions about lithium batteries, how to erase your laptops, repairing devices, recycler certifications, and the sorting process. Try asking: 'Can I recycle lithium batteries?' or 'How should I erase my laptop before recycling?'"
    
    for key, val in CHATBOT_QA.items():
        if key in msg:
            reply = val
            break
            
    return {"reply": reply}

# --- Rewards Leaderboard ---

@app.get("/api/rewards/leaderboard")
def get_leaderboard(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    current_user = get_current_user_from_header(authorization, db)
    
    # Fetch all users sorted by points
    users = db.query(UserDB).order_by(UserDB.eco_points.desc()).all()
    
    # Construct leaderboard list
    competitors = []
    user_rank = 0
    
    for idx, u in enumerate(users):
        is_current = u.id == current_user.id
        comp = {
            "full_name": u.full_name,
            "eco_points": u.eco_points,
            "avatar_url": u.avatar_url,
            "is_current": is_current,
            "rank": idx + 1
        }
        competitors.append(comp)
        if is_current:
            user_rank = idx + 1
            
    return {
        "leaderboard": competitors[:10], # Top 10
        "user_rank": user_rank,
        "user_points": current_user.eco_points
    }

# Serve public files for uploaded mock images
from fastapi.staticfiles import StaticFiles
os.makedirs("public", exist_ok=True)
app.mount("/public", StaticFiles(directory="public"), name="public")
