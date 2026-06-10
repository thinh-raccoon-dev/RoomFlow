import { Router, Request, Response } from 'express';
import User from '../models/User.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    const user = await User.create({ name, email, phone, password, role: role || 'landlord' });
    const payload = { userId: user._id.toString(), role: user.role };
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const payload = { userId: user._id.toString(), role: user.role };
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }
    const payload = verifyRefreshToken(refreshToken);
    res.json({ accessToken: signAccessToken({ userId: payload.userId, role: payload.role }) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
