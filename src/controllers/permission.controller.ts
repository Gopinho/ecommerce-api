import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

// Schemas de validação
const nameSchema = z.object({
  name: z.string().min(1)
});

const userPermissionSchema = z.object({
  userId: z.string().min(1),
  permissionId: z.string().min(1)
});

const userGroupSchema = z.object({
  userId: z.string().min(1),
  groupId: z.string().min(1)
});

// Criar permissão
export async function createPermission(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'permission.invalid_name', status: 400, details: parsed.error.errors });
    }
    const { name } = parsed.data;
    const permission = await prisma.permission.create({ data: { name } });
    res.status(201).json(permission);
  } catch (err) {
    next(err);
  }
}

// Listar permissões
export async function listPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (err) {
    next(err);
  }
}

// Criar grupo
export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'group.invalid_name', status: 400, details: parsed.error.errors });
    }
    const { name } = parsed.data;
    const group = await prisma.userGroup.create({ data: { name } });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
}

// Listar grupos
export async function listGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await prisma.userGroup.findMany();
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

// Associar permissão a utilizador
export async function addPermissionToUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = userPermissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'permission.invalid_data', status: 400, details: parsed.error.errors });
    }
    const { userId, permissionId } = parsed.data;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { permissions: { connect: { id: permissionId } } }
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Associar grupo a utilizador
export async function addUserToGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = userGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'group.invalid_data', status: 400, details: parsed.error.errors });
    }
    const { userId, groupId } = parsed.data;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { groupId }
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}