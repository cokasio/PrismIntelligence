# Financial Analysis Platform

A modern AI-powered financial analysis platform with multi-agent system capabilities, built with React, TypeScript, and Node.js. Features real-time chat interface, document processing, and intelligent financial insights.

## 🚀 Features

### Core Functionality
- **Multi-Agent Financial Analysis**: AI-powered system with specialized agents for different aspects of financial analysis
- **Real-time Chat Interface**: Interactive chat system for querying financial data and receiving insights
- **Document Processing**: Upload and analyze financial documents (CSV, Excel, PDF)
- **Session Management**: Create, manage, and track analysis sessions
- **WebSocket Communication**: Real-time updates and notifications

### AI Agents
- **Income Analyst**: Analyzes revenue patterns and profitability trends
- **Balance Analyst**: Evaluates asset structure and capital allocation
- **Cash Flow Analyst**: Analyzes cash generation and investment patterns
- **Strategic Advisor**: Provides strategic recommendations and insights

### Supported Document Types
- Income Statements
- Balance Sheets
- Cash Flow Reports
- General Ledger data (CSV/Excel format)

## 🏗️ Architecture

### Frontend (Client)
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **TailwindCSS** with modern design system
- **TanStack Query** for data fetching and caching
- **Wouter** for client-side routing
- **Lucide React** for icons

### Backend (Server)
- **Node.js** with Express
- **TypeScript** for type safety
- **WebSocket** for real-time communication
- **PostgreSQL** database with Drizzle ORM
- **File upload** with Multer

### Key Libraries & Tools
- **Drizzle ORM**: Database management and migrations
- **Zod**: Schema validation
- **Date-fns**: Date manipulation
- **Recharts**: Data visualization
- **React Hook Form**: Form management

## 📁 Project Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (buttons, inputs, etc.)
│   │   │   └── chat/          # Chat-specific components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   ├── pages/             # Page components
│   │   └── main.tsx           # Application entry point
│   └── public/                # Static assets
├── server/                     # Backend Node.js application
│   ├── db.ts                  # Database connection setup
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes and WebSocket handling
│   ├── storage.ts             # Database operations interface
│   ├── services/              # Business logic services
│   │   ├── email-service.ts   # Email processing
│   │   ├── financial-processor.ts # Financial data processing
│   │   └── llm-clients.ts     # AI/LLM integration
│   └── vite.ts                # Vite integration for development
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Database schema and TypeScript types
└── attached_assets/           # Project assets and documentation
```

## 🎨 Design System

The application follows modern design principles inspired by 21st.dev with:

- **Glass morphism effects** with backdrop blur
- **Gradient accents** using Datarails brand colors
- **Smooth animations** and transitions
- **Responsive design** for all screen sizes
- **Dark/light mode support**

### Color Scheme
- Primary: Navy blue gradients
- Accent: Pink/magenta highlights
- Background: Subtle gradients with transparency
- Text: High contrast for accessibility

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-analysis-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser to `http://localhost:5000`

### Environment Variables

Required environment variables:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NODE_ENV="development"
```

Optional environment variables for AI features:
```bash
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GOOGLE_API_KEY="your-google-key"
DEEPSEEK_API_KEY="your-deepseek-key"
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database migrations

### Development Workflow

1. **Database Changes**
   - Modify schemas in `shared/schema.ts`
   - Update storage interface in `server/storage.ts`
   - Run `npm run db:push` to apply changes

2. **Adding New Features**
   - Create components in `client/src/components/`
   - Add API routes in `server/routes.ts`
   - Update types in `shared/schema.ts`

3. **Styling**
   - Use TailwindCSS utility classes
   - Follow the established design system
   - Add custom styles in `client/src/index.css`

## 🔌 API Endpoints

### Sessions
- `GET /api/sessions` - List all chat sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get specific session
- `PUT /api/sessions/:id` - Update session

### Messages
- `GET /api/sessions/:id/messages` - Get session messages
- `POST /api/sessions/:id/messages` - Send new message

### File Upload
- `POST /api/upload` - Upload financial documents

### WebSocket Events
- `join_session` - Join a chat session
- `chat_message` - Send/receive chat messages
- `agent_status` - Agent status updates
- `file_processed` - File processing notifications

## 🤖 AI Integration

The platform integrates with multiple AI providers:

### Supported Providers
- **OpenAI GPT-4** - General analysis and chat
- **Anthropic Claude** - Deep financial reasoning
- **Google Gemini** - Document processing
- **DeepSeek** - Specialized financial models

### Agent System
Each AI agent specializes in different aspects:
- Risk assessment and compliance
- Performance metrics calculation
- Trend analysis and forecasting
- Strategic recommendations

## 📊 Financial Data Processing

### Supported Formats
- **CSV files** with financial data
- **Excel spreadsheets** (.xlsx, .xls)
- **Email attachments** via email integration

### Data Processing Pipeline
1. **File Upload** - Multi-format file support
2. **Data Parsing** - Intelligent column detection
3. **Classification** - Automatic document type detection
4. **Metrics Calculation** - Financial ratios and KPIs
5. **AI Analysis** - Multi-agent processing
6. **Report Generation** - Formatted insights and recommendations

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Replit Deployments** - Recommended for easy deployment
- **Vercel/Netlify** - For frontend-focused deployments
- **Docker** - For containerized deployment
- **Traditional VPS** - For full control

### Environment Configuration
Ensure all required environment variables are set in production:
- Database connection string
- AI API keys (if using AI features)
- Session secrets
- CORS settings

## 🧪 Testing

The application includes:
- **Type checking** with TypeScript
- **Database validation** with Drizzle and Zod
- **Error handling** throughout the stack
- **WebSocket connection resilience**

## 📈 Performance

### Optimizations
- **Code splitting** with Vite
- **Image optimization** for assets
- **Database indexing** for queries
- **WebSocket connection pooling**
- **Caching** with TanStack Query

### Monitoring
- Real-time error logging
- Performance metrics tracking
- Database query optimization
- WebSocket connection monitoring

## 🔒 Security

### Features
- **Input validation** with Zod schemas
- **SQL injection protection** via Drizzle ORM
- **File upload validation** and sanitization
- **CORS configuration** for cross-origin requests
- **Environment variable protection**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify DATABASE_URL is correctly set
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

3. **WebSocket Issues**
   - Check firewall settings
   - Verify WebSocket proxy configuration
   - Test connection in browser dev tools

4. **File Upload Problems**
   - Check file size limits
   - Verify file format support
   - Ensure proper MIME type handling

### Support
For technical support or questions, please create an issue in the repository with:
- Detailed description of the problem
- Steps to reproduce
- Environment information
- Error logs (if applicable)

---

**Built with ❤️ using modern web technologies and AI-powered insights.**