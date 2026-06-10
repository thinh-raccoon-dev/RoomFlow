import { Router, Response } from 'express';
import Invoice from '../models/Invoice.model';
import Room from '../models/Room.model';
import Property from '../models/Property.model';
import { authenticate, requireLandlord, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireLandlord);

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find({ landlord: req.user!.userId });
    const propertyIds = properties.map(p => p._id);

    const allRooms = await Room.find({ property: { $in: propertyIds } });
    const totalRooms = allRooms.length;
    const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const invoices = await Invoice.find({
      room: { $in: allRooms.map(r => r._id) },
      month,
      year,
    });

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
    const pendingCount = invoices.filter(i => i.status === 'pending').length;
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    const propertyStats = await Promise.all(
      properties.map(async (p) => {
        const rooms = await Room.find({ property: p._id });
        return {
          id: p._id,
          name: p.name,
          totalRooms: rooms.length,
          occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
        };
      })
    );

    res.json({
      totalRooms,
      occupiedRooms,
      vacantRooms: totalRooms - occupiedRooms,
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      totalRevenue,
      pendingPayments: pendingCount,
      overduePayments: overdueCount,
      propertyStats,
      month,
      year,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/revenue', async (req: AuthRequest, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const properties = await Property.find({ landlord: req.user!.userId });
    const rooms = await Room.find({ property: { $in: properties.map(p => p._id) } });

    const monthly = await Promise.all(
      Array.from({ length: 12 }, (_, i) => i + 1).map(async (month) => {
        const invoices = await Invoice.find({
          room: { $in: rooms.map(r => r._id) },
          month,
          year: Number(year),
          status: 'paid',
        });
        return { month, revenue: invoices.reduce((s, i) => s + i.totalAmount, 0) };
      })
    );

    res.json({ year: Number(year), monthly });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
