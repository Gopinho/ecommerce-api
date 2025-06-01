import transporter from '../lib/mailer';

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: '"Minha Loja" <noreply@minhaloja.com>',
    to,
    subject,
    html,
  });
}
export async function sendOrderConfirmationEmail(to: string, orderDetails: string) {
  const subject = 'Confirmação de Pedido';
  const html = `
    <h1>Obrigado pela sua compra!</h1>
    <p>Detalhes do seu pedido:</p>
    <div>${orderDetails}</div>
  `;
  await sendEmail(to, subject, html);
}