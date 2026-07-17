import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../services/authService';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
export const documentsRouter = Router();

documentsRouter.use(requireAuth);

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

// List documents by shipment
documentsRouter.get('/', async (req, res) => {
  const { shipmentId } = req.query as { shipmentId?: string };
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId is required' });
  const docs = await prisma.document.findMany({
    where: { shipmentId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ documents: docs });
});

// Upload document for a shipment
documentsRouter.post('/upload', upload.single('file'), async (req, res) => {
  const user = (req as any).user;
  const { shipmentId } = req.body as { shipmentId: string };
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId is required' });
  if (!req.file) return res.status(400).json({ error: 'file is required' });

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  if (shipment.userId !== user.sub && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const relativeUrl = `/files/${req.file.filename}`;
  const doc = await prisma.document.create({
    data: {
      shipmentId,
      userId: user.sub,
      name: req.file.originalname,
      type: req.file.mimetype,
      url: relativeUrl,
      size: req.file.size,
    },
  });
  res.status(201).json({ document: doc });
});

// Download/stream document by id
documentsRouter.get('/:id/download', async (req, res) => {
  const { id } = req.params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || !doc.url) return res.status(404).json({ error: 'Document not found' });
  const filename = doc.url.replace('/files/', '');
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.download(filePath, doc.name);
});

// Delete document
documentsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  if (!doc.shipmentId) {
    return res.status(400).json({ error: 'Document is not associated with a shipment' });
  }

  const shipment = await prisma.shipment.findUnique({ where: { id: doc.shipmentId } });
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  if (shipment.userId !== user.sub && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // remove file
  if (doc.url) {
    const filename = doc.url.replace('/files/', '');
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
  await prisma.document.delete({ where: { id } });
  res.status(204).send();
});
