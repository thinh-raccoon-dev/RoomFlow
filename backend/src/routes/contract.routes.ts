import { Router, Response } from 'express';
import Contract from '../models/Contract.model';
import Room from '../models/Room.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, tenantId, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (roomId) filter.room = roomId;
    if (tenantId) filter.tenant = tenantId;
    if (status) filter.status = status;
    const contracts = await Contract.find(filter)
      .populate('room', 'roomNumber property')
      .populate('tenant', 'name email phone');
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const activeContract = await Contract.findOne({ room: req.body.room, status: 'active' });
    if (activeContract) {
      res.status(409).json({ message: 'Room already has an active contract' });
      return;
    }
    const contract = await Contract.create(req.body);
    await Room.findByIdAndUpdate(req.body.room, { status: 'occupied' });
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.put('/:id/end', async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      { status: 'ended', endDate: new Date() },
      { new: true }
    );
    if (!contract) { res.status(404).json({ message: 'Not found' }); return; }
    await Room.findByIdAndUpdate(contract.room, { status: 'vacant' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('room', 'roomNumber baseRent')
      .populate('tenant', 'name email phone');
    if (!contract) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
