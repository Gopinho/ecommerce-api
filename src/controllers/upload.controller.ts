import { Request, Response, NextFunction } from 'express';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5MB

export async function uploadProof(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw { message: 'upload.no_file', status: 400 };
    }
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return next({ message: 'upload.invalid_type', status: 400 });
    }
    if (req.file.size > maxSize) {
      return next({ message: 'upload.file_too_large', status: 400 });
    }
    // Caminho relativo para guardar no banco de dados, se necessário
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ message: req.__('upload.success'), fileUrl });
  } catch (err) {
    next(err);
  }
}