# Zaqathon - AI-Powered Order Processing System

A local-only MVP for processing customer emails and generating validated sales orders with AI assistance.

## 🚀 Features

- **AI Email Processing**: Extract order details from plain text emails using Groq LLM
- **Smart Validation**: Cross-reference items against product catalog with stock/MOQ checks
- **PDF Generation**: Auto-generate sales order forms from templates
- **Modern UI**: Beautiful React interface with real-time updates
- **Local-First**: No external dependencies, runs entirely offline after setup

## 🏗️ Architecture

```
├── apps/
│   ├── api/            # Fastify backend + SQLite + AI processing
│   └── web/            # Next.js 14 frontend with Tailwind
├── packages/
│   └── types/          # Shared TypeScript interfaces
└── data/               # Sample emails and product catalog
```

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- Groq API key (free at https://groq.com)

## 🛠️ Setup

1. **Clone and install**:
   ```bash
   cd zaqathon
   pnpm install
   ```

2. **Configure API key**:
   ```bash
   # Copy environment template
   cp apps/api/.env.example apps/api/.env
   
   # Edit apps/api/.env and add your Groq API key:
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   ```

3. **Process sample data**:
   ```bash
   pnpm seed
   ```
   This will:
   - Load product catalog into SQLite
   - Process sample emails with AI
   - Generate validation reports
   - Create PDF order forms

4. **Start development**:
   ```bash
   pnpm dev
   ```
   - API: http://localhost:4000
   - Web: http://localhost:3000

## 📊 Sample Data

The system includes 5 sample customer emails with various order scenarios:
- Perfect orders with matching products
- Orders with out-of-stock items  
- Orders below minimum quantity
- Orders with misspelled product names

## 🎯 Usage

1. **Dashboard**: View all processed orders with confidence scores
2. **Order Details**: Review AI extractions and validation issues
3. **PDF Download**: Get formatted sales order forms
4. **Re-ingest**: Process new samples with updated AI prompts

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests  
pnpm run test:e2e

# Linting
pnpm lint
```

## 📁 Key Files

- `apps/api/src/llm.ts` - AI extraction logic
- `apps/api/src/validator.ts` - Business rule validation
- `apps/api/src/pdf.ts` - PDF generation
- `apps/web/src/app/page.tsx` - Dashboard UI
- `data/` - Sample emails and product catalog

## 🔧 Development

- Built with **TypeScript** strict mode
- **Turborepo** for monorepo management  
- **SQLite** for simple local storage
- **Zod** for runtime validation
- **Framer Motion** for smooth animations

## 📝 License

MIT - see LICENSE file for details.

---

**Yair Korok Project**
