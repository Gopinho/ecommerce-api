import cors from 'cors';

export const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://teudominio.com'
  ],
  credentials: true
};

export default cors(corsOptions);