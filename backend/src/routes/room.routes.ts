import { Router, Response } from 'express';
import Room from '../models/Room.model';
import Property from '../models/Property.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId, status } = req.query;
    const myProperties = await Property.find({ landlord: req.user!.userId }).select('_id');
    const propertyIds = myProperties.map(p => p._id);
    const filter: Record<string, unknown> = { property: { $in: propertyIds } };
    if (propertyId) filter.property = propertyId;
    if (status) filter.status = status;
    const rooms = await Room.find(filter).populate('property', 'name address');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findOne({ _id: req.body.property, landlord: req.user!.userId });
    if (!property) { res.status(403).json({ message: 'Forbidden' }); return; }
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id).populate('property', 'name address electricityPricePerKwh waterPricePerM3');
    if (!room) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
