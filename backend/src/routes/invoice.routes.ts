import { Router, Response } from 'express';
import Invoice from '../models/Invoice.model';
import Contract from '../models/Contract.model';
import UtilityReading from '../models/UtilityReading.model';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, status, roomId, tenantId } = req.query;
    const filter: Record<string, unknown> = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (status) filter.status = status;
    if (roomId) filter.room = roomId;
    if (req.user!.role === 'tenant') filter.tenant = req.user!.userId;
    else if (tenantId) filter.tenant = tenantId;

    const invoices = await Invoice.find(filter)
      .populate('room', 'roomNumber')
      .populate('tenant', 'name phone')
      .sort({ year: -1, month: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'landlord') { res.status(403).json({ message: 'Forbidden' }); return; }
    const { roomId, month, year } = req.body;

    const contract = await Contract.findOne({ room: roomId, status: 'active' });
    if (!contract) { res.status(404).json({ message: 'No active contract for this room' }); return; }

    const reading = await UtilityReading.findOne({ room: roomId, month, year });
    const electricityCost = reading?.electricityCost || 0;
    const waterCost = reading?.waterCost || 0;
    const totalAmount = contract.rentPrice + electricityCost + waterCost;

    const dueDate = new Date(year, month - 1, 15);

    const invoice = await Invoice.create({
      room: roomId,
      contract: contract._id,
      tenant: contract.tenant,
      month,
      year,
      rentAmount: contract.rentPrice,
      electricityCost,
      waterCost,
      otherFees: 0,
      totalAmount,
      status: 'pending',
      dueDate,
      utilityReading: reading?._id,
    });

    res.status(201).json(invoice);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Invoice already exists for this room/month/year' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('room', 'roomNumber')
      .populate('tenant', 'name phone email')
      .populate('utilityReading');
    if (!invoice) { res.status(404).json({ message: 'Not found' }); return; }
    if (req.user!.role === 'tenant' && invoice.tenant.toString() !== req.user!.userId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
