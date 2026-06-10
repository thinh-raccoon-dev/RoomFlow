import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import MaintenanceRequest from '../models/MaintenanceRequest.model';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const storage = multer.diskStorage({
  destination: 'uploads/maintenance',
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'tenant') filter.tenant = req.user!.userId;
    const { status, roomId } = req.query;
    if (status) filter.status = status;
    if (roomId) filter.room = roomId;
    const requests = await MaintenanceRequest.find(filter)
      .populate('room', 'roomNumber')
      .populate('tenant', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/', upload.array('images', 5), async (req: AuthRequest, res: Response) => {
  try {
    const images = (req.files as Express.Multer.File[] | undefined)?.map(f =>
      path.join('uploads/maintenance', f.filename)
    ) || [];
    const request = await MaintenanceRequest.create({
      ...req.body,
      tenant: req.user!.userId,
      images,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.put('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'landlord') { res.status(403).json({ message: 'Forbidden' }); return; }
    const { status, resolvedNote } = req.body;
    const update: Record<string, unknown> = { status };
    if (status === 'resolved') { update.resolvedAt = new Date(); update.resolvedNote = resolvedNote; }
    const request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!request) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
