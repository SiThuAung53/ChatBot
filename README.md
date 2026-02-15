# ChatBot Platform

A full-featured drag-and-drop chatbot builder for Facebook Messenger and Telegram with visual Flow Builder, Google Sheets integration, team management, and customer analytics.

## Features

- **Drag & Drop Flow Builder** - Visual editor to create conversation flows with conditional logic, delays, variables, and integrations
- **Facebook Messenger Integration** - One-click connect to your Facebook Page
- **Telegram Integration** - One-click connect with automatic webhook setup
- **Google Sheets Integration** - Read and write data to Google Sheets from your flows
- **Sign in with Gmail** - Google OAuth authentication
- **Inbox** - Unified inbox for all conversations with ability to send flows
- **Team Management** - Invite members with role-based access (Owner, Admin, Member, Viewer)
- **Customer Analytics** - Track messages, contacts, channel performance, and flow executions
- **REST API** - Full API for Android app integration
- **OCR Service** - Extract text from images via OCR
- **External Service Integration** - Connect to any REST API from flows
- **Conditional Blocks** - Branch flows based on conditions (equals, contains, regex, etc.)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Flow Builder**: React Flow with custom nodes
- **State Management**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **APIs**: Google Sheets API, Facebook Graph API, Telegram Bot API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials
- Facebook App (for Messenger)
- Telegram Bot Token (from @BotFather)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd ChatBot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your credentials.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

All API endpoints require an API key via the `x-api-key` header. Generate keys from Settings > API Keys.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth` | Verify API key |
| GET | `/api/v1/contacts` | List contacts |
| GET | `/api/v1/chats` | List chats |
| GET | `/api/v1/chats/:id/messages` | Get messages |
| POST | `/api/v1/chats/:id/messages` | Send message |
| GET | `/api/v1/flows` | List flows |
| POST | `/api/v1/flows/:id/trigger` | Trigger flow |
| GET | `/api/v1/analytics` | Get analytics |
| POST | `/api/v1/ocr` | Process OCR |
| POST | `/api/v1/external` | Proxy external API |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth routes
│   │   ├── channels/       # Channel management
│   │   ├── flows/          # Flow CRUD
│   │   ├── inbox/          # Inbox & messaging
│   │   ├── team/           # Team management
│   │   ├── sheets/         # Google Sheets
│   │   ├── analytics/      # Analytics data
│   │   ├── settings/       # API key management
│   │   ├── webhooks/       # Platform webhooks
│   │   └── v1/             # REST API for mobile
│   ├── auth/               # Sign in page
│   └── dashboard/          # Dashboard pages
├── components/
│   ├── flow/               # Flow builder components
│   ├── layout/             # Sidebar, layout
│   └── providers/          # Auth provider
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   ├── messaging.ts        # Platform messaging
│   ├── flowEngine.ts       # Flow execution engine
│   ├── apiAuth.ts          # API key validation
│   └── utils.ts            # Utilities
├── store/
│   └── flowStore.ts        # Zustand flow state
└── types/
    ├── flow.ts             # Flow types
    └── next-auth.d.ts      # Auth types
```

## Flow Builder Node Types

- **Trigger** - Keyword, First Message, Button Click, Manual, API
- **Send Message** - Text messages with variables
- **Send Image** - Image messages
- **Send Buttons** - Messages with action buttons
- **Quick Reply** - Messages with quick reply options
- **Condition** - Branch on equals, contains, regex, greater/less than, exists
- **Delay** - Wait for specified seconds
- **Set Variable** - Store values for later use
- **HTTP Request** - Call external APIs
- **Google Sheet** - Read/append/update sheet data
- **Assign Agent** - Hand off to human agent
- **OCR Process** - Extract text from images

## License

MIT
