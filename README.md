# LogiX: Intelligent Cloud Storage Optimization

A production-ready cloud storage platform enhanced with reinforcement learning for automated storage optimization. Built for the Scaler Hackathon 2025.

## The Vision

Traditional cloud storage is passive—it waits for user commands. LogiX changes this paradigm by introducing an active, intelligent storage layer that learns your usage patterns and optimizes space automatically. Think of it as having a dedicated storage engineer constantly fine-tuning your cloud drive.

## What We Built

### Core Storage Platform
- **Enterprise-grade file management**: Upload, preview, organize, and manage files with a polished, intuitive interface
- **Secure authentication**: Production-ready user auth via Supabase
- **Real-time operations**: Instant file operations with proper error handling and loading states
- **Smart categorization**: Automatic file type detection and organization

### The AI Differentiation
- **Reinforcement Learning Engine**: Custom-built environment that treats storage optimization as a learning problem
- **Adaptive Decision Making**: AI agent that chooses between compression, deletion, and upload strategies
- **Continuous Optimization**: System learns to maintain optimal storage levels (around 50% capacity)
- **Visual Learning Tracking**: Real-time graphs showing the AI's decision process and improvement over time

## Technical Architecture

### Frontend Stack
- **Next.js 14** with App Router and React Server Components
- **TypeScript** for type-safe development
- **Tailwind CSS** for consistent, maintainable styling
- **Recharts** for data visualization
- **Framer Motion** for smooth animations

### Backend & AI
- **Supabase**: Handles authentication, file metadata, and user sessions
- **Python Flask API**: Serves the reinforcement learning model
- **Custom RL Environment**: Gym-like environment simulating storage dynamics
- **RESTful APIs**: Clean separation between frontend and AI services

## Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Supabase account

### Installation

1. **Clone and setup the frontend:**
```bash
git clone <repository-url>
cd logix
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase keys to .env.local

npm run dev
Frontend runs on http://localhost:3000

Start the AI service:
bash
cd rl_agent
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

pip install -r requirements.txt
python api.py
AI API available at http://127.0.0.1:5000

Environment Variables

env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (config.py)
DATABASE_URL=your_database_url
How the AI Works

Our reinforcement learning system operates on a simple but effective principle:

State Representation: Current storage usage percentage
Action Space: Delete files, compress data, or allow uploads
Reward Function: Maximizes points for maintaining ~50% storage utilization
Learning: Agent discovers optimal policies through trial and error
The system doesn't just react—it learns patterns and anticipates storage needs.

Project Structure

text
logix/
├── app/                    # Next.js 14 app directory
│   ├── components/        # Reusable React components
│   ├── lib/              # Utility functions and configurations
│   └── api/              # API route handlers
├── rl_agent/             # Python AI service
│   ├── storage_env.py    # Custom RL environment
│   ├── api.py           # Flask application
│   └── requirements.txt # Python dependencies
└── public/              # Static assets
Why This Matters

Most AI applications focus on content generation or analysis. We're applying AI to infrastructure—making the underlying storage layer intelligent. This approach has several advantages:

Transparent to users: Works automatically without requiring user input
Continuously improving: Gets better with more usage data
Resource-efficient: Optimizes costly cloud storage resources
Scalable: Can handle individual users or enterprise-scale deployments
Development Notes

Code Quality

ESLint configuration for consistent code style
TypeScript strict mode enabled
Component-based architecture with proper separation of concerns
Performance Considerations

Server-side rendering where appropriate
Efficient file upload handling with progress tracking
Optimized re-renders with proper React patterns
Future Roadmap

Real user data integration for personalized optimization
Advanced compression strategies for different file types
Predictive storage forecasting using historical patterns
Mobile applications with offline capability
Enterprise features: team management, advanced permissions

Team

Krishna Chaitanya - AI/ML Engineering
Responsible for the reinforcement learning environment, Flask API development, and AI integration strategies

Viveknath Pallati - Full Stack Development
Led frontend architecture, Supabase integration, API design, and overall application & data flow

Built For

Scaler Hackathon 2025 - focusing on practical AI applications that solve real-world problems.

License

This project is developed for educational and demonstration purposes as part of the Scaler Hackathon 2025.

LogiX represents a shift from passive storage to active, intelligent data management. We're not just building another cloud drive—we're building a smarter foundation for how we interact with our digital assets.
