import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables — resolve .env relative to this file's directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import chatRoutes from './routes/chat';
import workoutRoutes from './routes/workout';
import nutritionRoutes from './routes/nutrition';
import habitsRoutes from './routes/habits';
import profileRoutes from './routes/profile';
import dashboardRoutes from './routes/dashboard';
import { sanitizeInput, requestLogger, notFoundHandler, errorHandler } from './middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Security middleware
// ============================================================
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS — only allow configured origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o.trim()))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting — stricter on AI endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'AI request limit reached. Please wait before sending more messages.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (non-sensitive)
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// ============================================================
// Routes
// ============================================================
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ibmGraniteEnabled: !!(process.env.IBM_API_KEY && process.env.IBM_PROJECT_ID),
    version: '1.0.0',
  });
});

app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/nutrition', aiLimiter, nutritionRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', dashboardRoutes);

// ============================================================
// Error handlers
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start server
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🏋️  Fitness Buddy Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🤖 IBM Granite: ${
      process.env.IBM_API_KEY && process.env.IBM_PROJECT_ID
        ? '✅ Configured'
        : '⚠️  Not configured — using mock AI fallback'
    }\n`
  );
});

export default app;
