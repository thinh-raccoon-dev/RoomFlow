import { Router, Response } from 'express';
import Payment from '../models/Payment.model';
import Invoice from '../models/Invoice.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, amount, method, note } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) { res.status(404).json({ message: 'Invoice not found' }); return; }

    const payment = await Payment.create({
      invoice: invoiceId,
      amount,
      method,
      note,
      collectedBy: req.user!.userId,
    });

    await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid', paidAt: new Date() });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate({ path: 'invoice', populate: { path: 'room', select: 'roomNumber' } })
      .sort({ paidAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
