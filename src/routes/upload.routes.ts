import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/authenticate';
import { uploadProof } from '../controllers/upload.controller';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens ou PDF são permitidos.'));
    }
  },
});

/**
 * @openapi
 * /upload/proof:
 *   post:
 *     summary: Upload de comprovativo de pagamento/licença (imagem/PDF)
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Comprovativo enviado com sucesso!
 *       400:
 *         description: Nenhum ficheiro enviado ou formato inválido
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */
router.post('/proof', authenticate, upload.single('file'), uploadProof);

export default router;