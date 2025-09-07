import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export class JWTUtils {
  private static JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
  private static JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret';
  private static JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '15m';
  private static JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, this.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  }

  static generateTokenId(): string {
    return uuidv4();
  }

  static getRefreshTokenExpiration(): Date {
    const expiresIn = this.JWT_REFRESH_EXPIRES_IN;
    const now = new Date();
    
    // Parse the expiration string (e.g., "7d", "24h", "60m")
    const match = expiresIn.match(/^(\d+)([dhm])$/);
    if (!match || !match[1] || !match[2]) {
      throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        now.setDate(now.getDate() + value);
        break;
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() + value);
        break;
      default:
        throw new Error('Invalid time unit');
    }

    return now;
  }
}
