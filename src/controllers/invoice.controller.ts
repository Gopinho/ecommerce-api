import { Request, Response, NextFunction } from 'express';
import { generateInvoice } from '../services/invoice.service';
import path from 'path';
import archiver from 'archiver';
import prisma from '../prisma/client';
import fs from 'fs';

export async function downloadInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const filePath = await generateInvoice(id);
    const filename = path.basename(filePath);
    res.download(filePath, filename);
  } catch (err) {
    next(err);
  }
}

export async function downloadAllUserFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;

    // Busca todas as orders e licenças do utilizador
    const orders = await prisma.order.findMany({ where: { userId } });
    const licenses = await prisma.license.findMany({ where: { userId } });

    if (!orders.length && !licenses.length) {
      throw { message: 'user.no_files_found', status: 404 };
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="meus_ficheiros.zip"');
    const archive = archiver('zip');
    archive.pipe(res);

    for (const order of orders) {
      const invoicePath = await generateInvoice(order.id); // Gera o PDF na hora
      archive.file(invoicePath, { name: `invoices/invoices_${order.id}.pdf` });
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  }
}