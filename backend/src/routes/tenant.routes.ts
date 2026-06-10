import { Router, Response } from 'express';
import User from '../models/User.model';
import Contract from '../models/Contract.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tenants = await User.find({ role: 'tenant' }).select('-password');
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) { res.status(409).json({ message: 'Email already registered' }); return; }
    const tenant = await User.create({ name, email, phone, password: password || '123456', role: 'tenant' });
    res.status(201).json({ id: tenant._id, name: tenant.name, email: tenant.email, phone: tenant.phone });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await User.findOne({ _id: req.params.id, role: 'tenant' }).select('-password');
    if (!tenant) { res.status(404).json({ message: 'Not found' }); return; }
    const contracts = await Contract.find({ tenant: tenant._id })
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });
    res.json({ ...tenant.toObject(), contracts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { password, role, ...updateData } = req.body;
    const tenant = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'tenant' },
      updateData,
      { new: true }
    ).select('-password');
    if (!tenant) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
