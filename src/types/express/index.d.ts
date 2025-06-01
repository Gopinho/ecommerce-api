import { UserPayload } from '../../utils/jwt'; // ou ajusta para o tipo correto

declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}