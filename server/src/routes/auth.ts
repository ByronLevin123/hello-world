import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ValidationError, AuthenticationError } from '../errors';
import { AuthPayload } from '../middleware/auth';

export const authRouter = Router();

// Demo staff users — in production this would be a users table with hashed passwords
const STAFF_USERS = [
  { userId: '1', username: 'branch.user', password: bcrypt.hashSync('branch123', 10), role: 'branch' as const },
  { userId: '2', username: 'underwriter', password: bcrypt.hashSync('underwriter123', 10), role: 'underwriter' as const },
  { userId: '3', username: 'compliance', password: bcrypt.hashSync('compliance123', 10), role: 'compliance' as const },
  { userId: '4', username: 'executive', password: bcrypt.hashSync('executive123', 10), role: 'executive' as const },
  { userId: '5', username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' as const },
];

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const user = STAFF_USERS.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new AuthenticationError('Invalid username or password');
    }

    const payload: AuthPayload = { userId: user.userId, username: user.username, role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });
    const refreshToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      data: {
        token,
        refreshToken,
        user: { userId: user.userId, username: user.username, role: user.role },
        expiresIn: 28800,
      },
    });
  } catch (err) { next(err); }
});

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const payload = jwt.verify(refreshToken, config.jwtSecret) as AuthPayload;
    const newToken = jwt.sign(
      { userId: payload.userId, username: payload.username, role: payload.role },
      config.jwtSecret,
      { expiresIn: '8h' },
    );

    res.json({ data: { token: newToken, expiresIn: 28800 } });
  } catch {
    next(new AuthenticationError('Invalid or expired refresh token'));
  }
});
