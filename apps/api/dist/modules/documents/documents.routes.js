"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const authService_1 = require("../../services/authService");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.documentsRouter = (0, express_1.Router)();
exports.documentsRouter.use(authService_1.requireAuth);
// Ensure uploads directory exists
const uploadsDir = path_1.default.resolve(process.cwd(), 'server', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// List documents by shipment
exports.documentsRouter.get('/', async (req, res) => {
    const { shipmentId } = req.query;
    if (!shipmentId)
        return res.status(400).json({ error: 'shipmentId is required' });
    const docs = await prisma_1.default.document.findMany({
        where: { shipmentId },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ documents: docs });
});
// Upload document for a shipment
exports.documentsRouter.post('/upload', upload.single('file'), async (req, res) => {
    const user = req.user;
    const { shipmentId } = req.body;
    if (!shipmentId)
        return res.status(400).json({ error: 'shipmentId is required' });
    if (!req.file)
        return res.status(400).json({ error: 'file is required' });
    const shipment = await prisma_1.default.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment)
        return res.status(404).json({ error: 'Shipment not found' });
    if (shipment.userId !== user.sub && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const relativeUrl = `/files/${req.file.filename}`;
    const doc = await prisma_1.default.document.create({
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
exports.documentsRouter.get('/:id/download', async (req, res) => {
    const { id } = req.params;
    const doc = await prisma_1.default.document.findUnique({ where: { id } });
    if (!doc || !doc.url)
        return res.status(404).json({ error: 'Document not found' });
    const filename = doc.url.replace('/files/', '');
    const filePath = path_1.default.join(uploadsDir, filename);
    if (!fs_1.default.existsSync(filePath))
        return res.status(404).json({ error: 'File not found' });
    res.download(filePath, doc.name);
});
// Delete document
exports.documentsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const doc = await prisma_1.default.document.findUnique({ where: { id } });
    if (!doc)
        return res.status(404).json({ error: 'Document not found' });
    if (!doc.shipmentId) {
        return res.status(400).json({ error: 'Document is not associated with a shipment' });
    }
    const shipment = await prisma_1.default.shipment.findUnique({ where: { id: doc.shipmentId } });
    if (!shipment)
        return res.status(404).json({ error: 'Shipment not found' });
    if (shipment.userId !== user.sub && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    // remove file
    if (doc.url) {
        const filename = doc.url.replace('/files/', '');
        const filePath = path_1.default.join(uploadsDir, filename);
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
            }
            catch { }
        }
    }
    await prisma_1.default.document.delete({ where: { id } });
    res.status(204).send();
});
