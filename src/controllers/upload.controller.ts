import { Request, Response, NextFunction } from 'express';
import path from 'path';

export async function uploadProof(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw { message: 'upload.no_file', status: 400 };
    }
    // Caminho relativo para guardar no banco de dados, se necessário
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ message: req.__('upload.success'), fileUrl });
  } catch (err) {
    next(err);
  }
}