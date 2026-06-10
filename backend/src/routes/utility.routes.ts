import { Router, Response } from 'express';
import UtilityReading from '../models/UtilityReading.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, month, year } = req.query;
    const filter: Record<string, unknown> = {};
    if (roomId) filter.room = roomId;
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    const readings = await UtilityReading.find(filter).populate('room', 'roomNumber');
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const reading = new UtilityReading(req.body);
    await reading.save();
    res.status(201).json(reading);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Reading for this room/month/year already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const reading = await UtilityReading.findById(req.params.id);
    if (!reading) { res.status(404).json({ message: 'Not found' }); return; }
    Object.assign(reading, req.body);
    await reading.save();
    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
