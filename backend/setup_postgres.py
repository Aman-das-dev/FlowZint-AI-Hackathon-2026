import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

print("\n==========================================")
print("     EcoTrack AI Postgres Auto-Setup      ")
print("==========================================\n")

# Prompt user for their local postgres password
password = input("Enter your PostgreSQL password: ")

try:
    # Connect to the default 'postgres' database first to run creation commands
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password=password,
        host='localhost',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database already exists
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'ecotrack';")
    exists = cursor.fetchone()
    
    if not exists:
        cursor.execute("CREATE DATABASE ecotrack;")
        print("\n[✔] Successfully created database 'ecotrack'!")
    else:
        print("\n[✔] Database 'ecotrack' already exists.")
        
    cursor.close()
    conn.close()
    
    # Update the local .env configuration file
    env_path = ".env"
    if os.path.exists(env_path):
        import urllib.parse
        with open(env_path, "r") as f:
            lines = f.readlines()
            
        new_lines = []
        encoded_password = urllib.parse.quote_plus(password)
        db_url_line = f"DATABASE_URL=postgresql://postgres:{encoded_password}@localhost:5432/ecotrack\n"
        replaced = False
        
        for line in lines:
            if line.startswith("DATABASE_URL="):
                new_lines.append(db_url_line)
                replaced = True
            elif line.startswith("# DATABASE_URL="):
                new_lines.append(db_url_line)
                replaced = True
            else:
                new_lines.append(line)
                
        if not replaced:
            new_lines.append("\n" + db_url_line)
            
        with open(env_path, "w") as f:
            f.writelines(new_lines)
            
        print("[✔] Updated .env file successfully!")
    else:
        print("[❌] .env file not found!")
        
except Exception as e:
    print(f"\n[❌] Failed to connect: {e}")
    print("\nPlease verify that your PostgreSQL service is running and the password is correct.")

print("\n==========================================\n")
