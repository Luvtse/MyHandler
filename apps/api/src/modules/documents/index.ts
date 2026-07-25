import { Router } from 'express';
import prisma from '../../utils/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { requireAuth } from '../../services/authService';

const router = Router();
const uploadsDir = path.resolve(process.cwd(), 'server', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed types
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get documents for a shipment
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { shipmentId } = req.query;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: String(shipmentId) }
    });

    // Check if user owns the shipment or is admin
    if (shipment && req.user && (shipment.userId === req.user.id || req.user.role === 'admin')) {
      const documents = await prisma.document.findMany({
        where: { shipmentId: String(shipmentId) },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json(documents);
    }
    
    return res.status(403).json({ error: 'Not authorized to access these documents' });
  } catch (error) {
    next(error);
  }
});

// Upload document
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { shipmentId } = req.body;
    const file = req.file;
    
    if (!shipmentId) {
      // Remove uploaded file if shipmentId is missing
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Shipment ID is required' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId }
    });

    // Check if user owns the shipment or is admin
    if (shipment && req.user && (shipment.userId === req.user.id || req.user.role === 'admin')) {
      const document = await prisma.document.create({
        data: {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: `/files/${file.filename}`,
          userId: req.user.id,
          shipmentId
        }
      });
      
      return res.status(201).json(document);
    }
    
    // Remove uploaded file if not authorized
    fs.unlinkSync(file.path);
    return res.status(403).json({ error: 'Not authorized to upload documents for this shipment' });
  } catch (error) {
    // Remove uploaded file if there's an error
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
});

// Download document
router.get('/:id/download', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: { shipment: true }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if user owns the shipment or is admin
    if (document.shipment && req.user && ((document.shipment.userId === req.user.id) || req.user.role === 'admin')) {
      const filePath = path.join(uploadsDir, document.url.replace('/files/', ''));
      
      if (fs.existsSync(filePath)) {
        return res.download(filePath, document.name);
      } else {
        return res.status(404).json({ error: 'File not found on server' });
      }
    }
    
    return res.status(403).json({ error: 'Not authorized to download this document' });
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: { shipment: true }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if user owns the shipment or is admin
    if (document.shipment && req.user && ((document.shipment.userId === req.user.id) || req.user.role === 'ADMIN')) {
      // Delete file from filesystem
      const filePath = path.join(uploadsDir, document.url.replace('/files/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete document record
      await prisma.document.delete({
        where: { id }
      });
      
      return res.status(200).json({ message: 'Document deleted successfully' });
    }
    
    return res.status(403).json({ error: 'Not authorized to delete this document' });
  } catch (error) {
    next(error);
  }
});

export const documentsRouter = router;
