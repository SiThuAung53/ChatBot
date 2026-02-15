# Ubuntu Server Installation Guide

Complete step-by-step guide to deploy the ChatBot Platform on Ubuntu Server (20.04 / 22.04 / 24.04).

---

## Table of Contents

1. [Server Requirements](#1-server-requirements)
2. [Initial Server Setup](#2-initial-server-setup)
3. [Install Node.js](#3-install-nodejs)
4. [Install PostgreSQL](#4-install-postgresql)
5. [Clone the Project](#5-clone-the-project)
6. [Configure Environment Variables](#6-configure-environment-variables)
7. [Set Up Google OAuth](#7-set-up-google-oauth)
8. [Set Up Facebook Messenger](#8-set-up-facebook-messenger)
9. [Set Up Telegram Bot](#9-set-up-telegram-bot)
10. [Set Up Google Sheets](#10-set-up-google-sheets)
11. [Build and Run](#11-build-and-run)
12. [Set Up Nginx Reverse Proxy](#12-set-up-nginx-reverse-proxy)
13. [SSL with Let's Encrypt](#13-ssl-with-lets-encrypt)
14. [Run as a System Service (PM2)](#14-run-as-a-system-service-pm2)
15. [Firewall Configuration](#15-firewall-configuration)
16. [Verify Installation](#16-verify-installation)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2+ vCPU |
| RAM | 1 GB | 2+ GB |
| Storage | 10 GB | 20+ GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| Domain | Required for webhooks | Point A record to server IP |

---

## 2. Initial Server Setup

SSH into your server:

```bash
ssh root@your-server-ip
```

Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

Install essential packages:

```bash
sudo apt install -y curl wget git build-essential
```

(Optional) Create a non-root user:

```bash
adduser chatbot
usermod -aG sudo chatbot
su - chatbot
```

---

## 3. Install Node.js

Install Node.js 20 LTS using NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

---

## 4. Install PostgreSQL

Install PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
```

Start and enable PostgreSQL:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create the database and user:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL shell, run:

```sql
CREATE USER chatbot_user WITH PASSWORD 'your_strong_password_here';
CREATE DATABASE chatbot_platform OWNER chatbot_user;
GRANT ALL PRIVILEGES ON DATABASE chatbot_platform TO chatbot_user;
\q
```

> **Important:** Replace `your_strong_password_here` with a strong password. You'll use this in the `.env` file.

---

## 5. Clone the Project

```bash
cd /home/chatbot   # or your preferred directory
git clone https://github.com/SiThuAung53/ChatBot.git
cd ChatBot
```

Install dependencies:

```bash
npm install
```

---

## 6. Configure Environment Variables

Create the `.env` file:

```bash
cp .env.example .env
nano .env
```

Fill in all values:

```env
# Database (use the password you created in Step 4)
DATABASE_URL="postgresql://chatbot_user:your_strong_password_here@localhost:5432/chatbot_platform"

# NextAuth (replace with your actual domain)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-random-string-here"

# Google OAuth (see Step 7)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook Messenger (see Step 8)
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_VERIFY_TOKEN="any-random-string-you-choose"

# Telegram (see Step 9)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Google Sheets (see Step 10)
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account-email"
GOOGLE_SHEETS_PRIVATE_KEY="your-private-key"

# OCR Service (optional - get free key at https://ocr.space/ocrapi)
OCR_API_KEY="your-ocr-api-key"
OCR_API_URL="https://api.ocr.space/parse/image"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Save and close: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 7. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**
5. Select **Web application**
6. Add Authorized redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
7. Copy the **Client ID** and **Client Secret** to your `.env` file

> Also enable the **Google Sheets API** in APIs & Services > Library if you plan to use Sheets integration.

---

## 8. Set Up Facebook Messenger

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new App (type: **Business**)
3. Add the **Messenger** product
4. Under Messenger Settings:
   - Generate a **Page Access Token** for your Facebook Page
   - Set up Webhooks:
     - **Callback URL**: `https://yourdomain.com/api/webhooks/facebook_messenger/{channelId}`
     - **Verify Token**: Same as `FACEBOOK_VERIFY_TOKEN` in your `.env`
     - Subscribe to: `messages`, `messaging_postbacks`
5. Copy **App ID** and **App Secret** to `.env`

> Note: The `{channelId}` in the webhook URL will be generated after you connect a channel in the dashboard. You can update the webhook URL in Facebook after that.

---

## 9. Set Up Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the instructions
3. Copy the **Bot Token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Paste it in your `.env` as `TELEGRAM_BOT_TOKEN`

> The webhook is automatically configured when you connect a Telegram channel in the dashboard.

---

## 10. Set Up Google Sheets

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin > Service Accounts**
3. Create a new service account
4. Create a **JSON key** for the service account
5. From the JSON key file, copy:
   - `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`
6. **Share your Google Sheets** with the service account email (give Editor access)

---

## 11. Build and Run

Generate Prisma client and push schema to database:

```bash
npx prisma generate
npx prisma db push
```

Build the production application:

```bash
npm run build
```

Test that it runs:

```bash
npm run start
```

Visit `http://your-server-ip:3000` — you should see the sign-in page.

Press `Ctrl+C` to stop (we'll set up PM2 for production in Step 14).

---

## 12. Set Up Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt install -y nginx
```

Create the site configuration:

```bash
sudo nano /etc/nginx/sites-available/chatbot
```

Paste the following (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default    # Remove default site
sudo nginx -t                                # Test config
sudo systemctl restart nginx
```

---

## 13. SSL with Let's Encrypt

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts (enter your email, agree to terms).

Certbot auto-renews. Verify with:

```bash
sudo certbot renew --dry-run
```

> **After SSL is set up**, update your `.env`:
> ```
> NEXTAUTH_URL="https://yourdomain.com"
> ```
> Then rebuild: `npm run build` and restart the app.

---

## 14. Run as a System Service (PM2)

Install PM2 globally:

```bash
sudo npm install -g pm2
```

Start the application:

```bash
cd /home/chatbot/ChatBot
pm2 start npm --name "chatbot" -- start
```

Configure PM2 to start on boot:

```bash
pm2 startup systemd
```

Run the command it outputs (it will look like):

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u chatbot --hp /home/chatbot
```

Save the process list:

```bash
pm2 save
```

### Useful PM2 Commands

```bash
pm2 status              # Check status
pm2 logs chatbot        # View logs
pm2 restart chatbot     # Restart app
pm2 stop chatbot        # Stop app
pm2 monit               # Monitor resources
```

---

## 15. Firewall Configuration

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Expected output:

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## 16. Verify Installation

### Checklist

- [ ] Visit `https://yourdomain.com` — Sign-in page loads
- [ ] Click "Sign in with Google" — Redirects to Google OAuth
- [ ] After sign-in — Dashboard loads with sidebar
- [ ] Go to **Channels** — Can see Facebook Messenger and Telegram connect buttons
- [ ] Go to **Flow Builder** — Can create a new flow and drag nodes
- [ ] Go to **Settings** — Can generate API keys
- [ ] Test API: `curl -H "x-api-key: YOUR_KEY" https://yourdomain.com/api/v1/chats`

### Quick Health Check

```bash
# App is running
pm2 status

# Nginx is running
sudo systemctl status nginx

# PostgreSQL is running
sudo systemctl status postgresql

# SSL certificate is valid
sudo certbot certificates

# Check application logs
pm2 logs chatbot --lines 50
```

---

## 17. Troubleshooting

### App won't start

```bash
# Check logs
pm2 logs chatbot --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Rebuild
npm run build
pm2 restart chatbot
```

### Database connection error

```bash
# Test PostgreSQL connection
sudo -u postgres psql -c "SELECT 1;"

# Check if database exists
sudo -u postgres psql -l | grep chatbot

# Re-push schema
npx prisma db push
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running on port 3000
curl http://127.0.0.1:3000

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart both
pm2 restart chatbot
sudo systemctl restart nginx
```

### Google OAuth redirect error

- Make sure `NEXTAUTH_URL` in `.env` matches your actual domain (with `https://`)
- Make sure the redirect URI in Google Cloud Console matches:
  `https://yourdomain.com/api/auth/callback/google`
- Rebuild after changing `.env`: `npm run build && pm2 restart chatbot`

### Webhook not receiving messages

- Facebook/Telegram webhooks require **HTTPS** (SSL must be set up)
- Check webhook URL is correct in the platform settings
- Check logs: `pm2 logs chatbot --lines 100`

### Prisma schema changes

If you update the database schema:

```bash
npx prisma db push
npx prisma generate
npm run build
pm2 restart chatbot
```

---

## Quick Reference — Full Install (Copy-Paste)

For experienced users, here's the condensed version:

```bash
# System setup
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx postgresql postgresql-contrib

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo -u postgres psql -c "CREATE USER chatbot_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE chatbot_platform OWNER chatbot_user;"

# Clone & install
git clone https://github.com/SiThuAung53/ChatBot.git
cd ChatBot
npm install

# Environment
cp .env.example .env
nano .env    # Fill in all values

# Database & build
npx prisma generate
npx prisma db push
npm run build

# PM2
sudo npm install -g pm2
pm2 start npm --name "chatbot" -- start
pm2 startup systemd
pm2 save

# Nginx
sudo nano /etc/nginx/sites-available/chatbot   # Add config
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Firewall
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```
