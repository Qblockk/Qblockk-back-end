import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Cargar variables de entorno
dotenv.config();

const app: Express = express();
const PORT = process.env['PORT'] || 3002;

// Middlewares de seguridad
app.use(helmet());

// CORS configuración
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth Service is running',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    version: '1.0.0'
  });
});

// Rutas de autenticación
app.use('/auth', authRoutes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Middleware de manejo de errores global
app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env['NODE_ENV'] === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Auth Service ejecutándose en puerto ${PORT}`);
  console.log(`Entorno: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints: http://localhost:${PORT}/auth`);
});

export default app;
