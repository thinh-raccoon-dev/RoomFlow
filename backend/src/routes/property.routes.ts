import { Router, Response } from 'express';
import Property from '../models/Property.model';
import Room from '../models/Room.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find({ landlord: req.user!.userId });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.create({ ...req.body, landlord: req.user!.userId });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, landlord: req.user!.userId });
    if (!property) { res.status(404).json({ message: 'Not found' }); return; }
    const rooms = await Room.find({ property: property._id });
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    res.json({ ...property.toObject(), totalRooms: rooms.length, occupiedRooms: occupied });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user!.userId },
      req.body,
      { new: true }
    );
    if (!property) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Property.findOneAndDelete({ _id: req.params.id, landlord: req.user!.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
