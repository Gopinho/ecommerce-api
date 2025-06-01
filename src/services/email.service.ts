import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: '"Loja Online" <no-reply@loja.com>',
    to,
    subject: 'Redefinição de password',
    html: `
      <p>Recebemos um pedido de redefinição de password.</p>
      <p>Clica no link abaixo para continuar:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este link expira em 15 minutos.</p>
    `,
  });

  console.log('Mensagem enviada: %s', info.messageId);
  console.log('Visualiza em: %s', nodemailer.getTestMessageUrl(info));
}
