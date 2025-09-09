import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error']
});


declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido' 
    });
    return;
  }

  try {
    const decoded = JWTUtils.verifyAccessToken(token);
    req.user = decoded;
    
    // Actualizar last_log del usuario automáticamente
    try {
      await prisma.app_users.update({
        where: { id: BigInt(decoded.userId) },
        data: { last_log: new Date() }
      });
    } catch (updateError) {
      console.error('Error al actualizar last_log:', updateError);
      // No interrumpir el flujo si falla la actualización del log
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para acceder a este recurso' 
      });
      return;
    }

    next();
  };
};
