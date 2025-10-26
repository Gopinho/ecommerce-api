import cors from 'cors';

export const corsOptions = {
    origin: [
        'https://dashboard.goncalopinho.pt',
        'https://www.goncalopinho.pt',
        'https://localhost:4000',
        'http://localhost:4000'
    ],
    credentials: true
};

export default cors(corsOptions);