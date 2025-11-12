# 🗄️ MongoDB Setup Guide

This guide will walk you through setting up MongoDB for Lattelink, either locally or using MongoDB Atlas (cloud).

## Option 1: MongoDB Atlas (Recommended for Beginners) ☁️

MongoDB Atlas is a cloud-hosted MongoDB service with a free tier. This is the easiest option and requires no local installation.

### Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your details and create an account
4. Verify your email address

### Step 2: Create a Cluster

1. After logging in, you'll see the **"Deploy a cloud database"** screen
2. Choose **"M0 Free"** (Free Shared tier) - this is perfect for development
3. Select a **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Choose a **Region** closest to you (e.g., `us-east-1` for US East)
5. Click **"Create"** (cluster name is optional, defaults to "Cluster0")
6. Wait 3-5 minutes for the cluster to be created

### Step 3: Create a Database User

1. You'll be prompted to create a database user
2. Enter a **Username** (e.g., `lattelink-user`)
3. Enter a **Password** (save this securely!)
4. Click **"Create Database User"**
5. For **"Where would you like to connect from?"**, select **"My Local Environment"** (or add your IP later)

### Step 4: Configure Network Access

1. You'll see **"Network Access"** setup
2. Click **"Add My Current IP Address"** (this allows your computer to connect)
3. Or click **"Allow Access from Anywhere"** (for development only - not recommended for production)
4. Click **"Finish and Close"**

### Step 5: Get Your Connection String

1. In the Atlas dashboard, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** as the driver
4. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name at the end (before the `?`):
   ```
   mongodb+srv://lattelink-user:yourpassword@cluster0.xxxxx.mongodb.net/lattelink?retryWrites=true&w=majority
   ```

### Step 6: Update Your Backend Configuration

1. Open `backend/.env` (create it if it doesn't exist)
2. Add your connection string:
   ```
   MONGODB_URI=mongodb+srv://lattelink-user:yourpassword@cluster0.xxxxx.mongodb.net/lattelink?retryWrites=true&w=majority
   PORT=3001
   NODE_ENV=development
   ```
3. **Important**: Replace `yourpassword` with your actual password!

### ✅ You're Done!

Your backend will now connect to MongoDB Atlas. Start your backend server:
```bash
cd backend
npm run dev
```

You should see: `✅ Connected to MongoDB`

---

## Option 2: Local MongoDB Installation 💻

If you prefer to run MongoDB on your local machine, follow these steps.

### macOS Installation

#### Using Homebrew (Recommended)

1. **Install Homebrew** (if you don't have it):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install MongoDB**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

3. **Start MongoDB**:
   ```bash
   brew services start mongodb-community
   ```

4. **Verify it's running**:
   ```bash
   mongosh
   ```
   You should see a MongoDB shell prompt. Type `exit` to leave.

#### Manual Installation

1. Download MongoDB from [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)
2. Choose **macOS** → **tgz** package
3. Extract and move to `/usr/local/mongodb`
4. Add to PATH in your `~/.zshrc` or `~/.bash_profile`:
   ```bash
   export PATH="/usr/local/mongodb/bin:$PATH"
   ```
5. Create data directory:
   ```bash
   sudo mkdir -p /usr/local/var/mongodb
   sudo chown $(whoami) /usr/local/var/mongodb
   ```
6. Start MongoDB:
   ```bash
   mongod --dbpath /usr/local/var/mongodb
   ```

### Windows Installation

1. **Download MongoDB**:
   - Go to [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)
   - Select **Windows** → **MSI** installer
   - Download and run the installer

2. **Installation Options**:
   - Choose **"Complete"** installation
   - Check **"Install MongoDB as a Service"**
   - Choose **"Run service as Network Service user"**
   - Check **"Install MongoDB Compass"** (GUI tool - optional but helpful)

3. **Verify Installation**:
   - Open Command Prompt or PowerShell
   - Run:
     ```bash
     mongosh
     ```
   - You should see the MongoDB shell

4. **Start MongoDB Service** (if not running automatically):
   - Open **Services** (Win + R → `services.msc`)
   - Find **"MongoDB"** service
   - Right-click → **Start** (if not already running)

### Linux Installation (Ubuntu/Debian)

1. **Import MongoDB public key**:
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB repository**:
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Start on boot
   ```

5. **Verify**:
   ```bash
   mongosh
   ```

### Configure Backend for Local MongoDB

1. Open `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/lattelink
   PORT=3001
   NODE_ENV=development
   ```

2. The default local connection string is:
   - `mongodb://localhost:27017/lattelink`
   - `27017` is the default MongoDB port
   - `lattelink` is your database name

### ✅ Test Your Local Setup

1. **Start MongoDB** (if not running as a service):
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows - should run automatically as a service
   ```

2. **Test connection**:
   ```bash
   mongosh
   ```
   You should see: `Current Mongosh Log ID: ...`

3. **Start your backend**:
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `✅ Connected to MongoDB`

---

## Troubleshooting 🔧

### "Cannot connect to MongoDB"

**For Atlas:**
- Check your IP is whitelisted in Network Access
- Verify username/password in connection string
- Ensure cluster is running (not paused)

**For Local:**
- Check MongoDB is running:
  ```bash
  # macOS
  brew services list
  
  # Linux
  sudo systemctl status mongod
  
  # Windows
  # Check Services app
  ```
- Try connecting manually:
  ```bash
  mongosh
  ```

### "Authentication failed"

- Double-check username and password in connection string
- For Atlas: Make sure you're using the database user, not your Atlas account
- For Local: If you set up authentication, ensure credentials match

### Port 27017 already in use

- Another MongoDB instance might be running
- Check with: `lsof -i :27017` (macOS/Linux) or `netstat -ano | findstr :27017` (Windows)
- Stop the other instance or change MongoDB port

### Connection timeout (Atlas)

- Check your firewall isn't blocking MongoDB
- Verify your IP is whitelisted
- Try "Allow Access from Anywhere" temporarily for testing

---

## Which Option Should I Choose? 🤔

**Choose MongoDB Atlas if:**
- ✅ You're new to MongoDB
- ✅ You want to avoid local installation
- ✅ You need to access the database from multiple devices
- ✅ You're planning to deploy soon

**Choose Local MongoDB if:**
- ✅ You prefer local development
- ✅ You want to work offline
- ✅ You have experience with database administration
- ✅ You want full control over your database

---

## Next Steps

Once MongoDB is set up:

1. **Seed sample data**:
   ```bash
   cd backend
   node scripts/seed-sample-data.js
   ```

2. **Start your backend**:
   ```bash
   npm run dev
   ```

3. **Start your frontend**:
   ```bash
   cd ../frontend
   npm run dev
   ```

4. **Test it out**: Open `http://localhost:3000` and search for "Berkeley"!

---

## Need Help?

- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com/)
- **MongoDB Community Forum**: [community.mongodb.com](https://community.mongodb.com/)
- **MongoDB University**: Free courses at [university.mongodb.com](https://university.mongodb.com/)

