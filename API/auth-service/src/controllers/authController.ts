import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { JWTUtils } from '../utils/jwt';

const prisma = new PrismaClient({
  log: ['error']
});

export class AuthController {
  // POST /auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, fullName, phone } = req.body as {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        phone?: string;
      };

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Verificar si el usuario ya existe
      const existingUser = await prisma.app_users.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'El usuario ya existe'
        });
        return;
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const user = await prisma.app_users.create({
        data: {
          email,
          password: hashedPassword,
          full_name: fullName || `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario',
          phone: phone || null,
        }
      });

      // Generar tokens
      const tokenId = JWTUtils.generateTokenId();
      const accessToken = JWTUtils.generateAccessToken({
        userId: user.id.toString(),
        email: user.email,
        role: user.role || 'user'
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user.id.toString(),
        tokenId
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user.id.toString(),
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Buscar usuario
      const user = await prisma.app_users.findUnique({
        where: { email }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }

      // Verificar contraseña
      if (!user.password) {
        res.status(401).json({
          success: false,
          message: 'Usuario sin contraseña configurada'
        });
        return;
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }

      // Actualizar last_log
      await prisma.app_users.update({
        where: { id: user.id },
        data: { last_log: new Date() }
      });

      // Generar tokens
      const tokenId = JWTUtils.generateTokenId();
      const accessToken = JWTUtils.generateAccessToken({
        userId: user.id.toString(),
        email: user.email,
        role: user.role || 'user'
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user.id.toString(),
        tokenId
      });

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user.id.toString(),
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            last_log: new Date()
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /auth/refresh
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as {
        refreshToken?: string;
      };

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token requerido'
        });
        return;
      }

      // Verificar refresh token
      let decoded;
      try {
        decoded = JWTUtils.verifyRefreshToken(refreshToken);
      } catch (error) {
        res.status(403).json({
          success: false,
          message: 'Refresh token inválido o expirado'
        });
        return;
      }

      // Buscar usuario
      const user = await prisma.app_users.findUnique({
        where: { id: BigInt(decoded.userId) }
      });

      if (!user) {
        res.status(403).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Generar nuevo access token
      const newAccessToken = JWTUtils.generateAccessToken({
        userId: user.id.toString(),
        email: user.email,
        role: user.role || 'user'
      });

      res.status(200).json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          accessToken: newAccessToken,
          user: {
            id: user.id.toString(),
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            last_log: user.last_log
          }
        }
      });

    } catch (error) {
      console.error('Error en refresh:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /auth/logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /auth/profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Obtener información completa del usuario
      const user = await prisma.app_users.findUnique({
        where: { id: BigInt(req.user.userId) }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id.toString(),
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            last_log: user.last_log,
            createdAt: user.created_at
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}