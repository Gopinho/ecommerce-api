import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { validateLicense } from '../services/license.service';
import path from 'path';
import fs from 'fs';

export async function listUserLicenses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id; // assumindo middleware auth preenche req.user
    const licenses = await prisma.license.findMany({ where: { userId } });
    res.json(licenses);
  } catch (err) {
    next(err);
  }
}

export async function renewLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const { licenseKey } = req.body;

    // Aqui podes integrar com pagamento ou só estender data (exemplo)
    const license = await prisma.license.update({
      where: { key: licenseKey },
      data: { expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000), status: 'active' }, // +30 dias
    });

    res.json({ message: req.__('license.renewed'), license });
  } catch (err) {
    next(err);
  }
}

export async function revokeLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const { licenseKey } = req.body;

    // Verifica role admin (middleware)

    await prisma.license.update({
      where: { key: licenseKey },
      data: { status: 'revoked' },
    });

    res.json({ message: req.__('license.revoked') });
  } catch (err) {
    next(err);
  }
}

export async function downloadSoftware(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, licenseKey } = req.query;
    if (!productId || !licenseKey) {
      throw { message: 'license.missing_params', status: 400 };
    }

    const license = await validateLicense(licenseKey as string);

    if (license.productId !== productId) {
      throw { message: 'license.invalid_for_product', status: 403 };
    }

    // Caminho do ficheiro (exemplo)
    const softwarePath = path.join(__dirname, '..', 'software_files', `${productId}.zip`);

    if (!fs.existsSync(softwarePath)) {
      throw { message: 'license.not_found', status: 404 };
    }

    res.download(softwarePath, `${productId}.zip`);
  } catch (err: any) {
    next(err);
  }
}

export async function simulateAutoRenew(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const { licenseId } = req.body;

    // Busca a licença
    const license = await prisma.license.findUnique({
      where: { id: licenseId, userId }
    });

    if (!license) {
      return res.status(404).json({ error: req.__('license.not_found') });
    }

    // Simula renovação: adiciona +1 ano à data de expiração (ou o período que quiseres)
    const newExpiresAt = new Date(license.expiresAt || new Date());
    newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);

    // Não altera no banco, só simula!
    res.json({
      message: req.__('license.renewal_simulated'),
      oldExpiresAt: license.expiresAt,
      simulatedNewExpiresAt: newExpiresAt
    });
  } catch (err) {
    next(err);
  }
}