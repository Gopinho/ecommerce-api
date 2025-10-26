import nodemailer from 'nodemailer';
import { TemplateService } from './template.service';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
    },
});

export class EmailService {
    private templateService = new TemplateService();

    async sendPasswordResetEmail(to: string, token: string) {
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

    async sendWelcomeEmail(to: string, firstName: string) {
        try {
            const htmlContent = await this.templateService.createWelcomeEmail(firstName, to);

            const info = await transporter.sendMail({
                from: '"Loja Fashion" <newsletter@loja.com>',
                to,
                subject: 'Bem-vindo à nossa Newsletter! 🎉',
                html: htmlContent,
                text: this.htmlToText(htmlContent)
            });

            console.log('Welcome email enviado: %s', info.messageId);
            console.log('Visualiza em: %s', nodemailer.getTestMessageUrl(info));
            return info;
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw error;
        }
    }

    async sendCampaignEmail(
        to: string,
        subject: string,
        htmlContent: string,
        plainTextContent: string,
        trackingData: {
            campaignId: string;
            subscriberId: string;
            firstName: string;
        }
    ) {
        try {
            // Add tracking pixels and personalization
            const trackingPixel = `<img src="http://localhost:3000/newsletter/track/open/${trackingData.campaignId}/${trackingData.subscriberId}" width="1" height="1" style="display:none;" />`;

            // Create campaign email using template service
            const campaignEmail = await this.templateService.createCampaignEmail({
                title: subject,
                content: htmlContent,
                firstName: trackingData.firstName,
                email: to,
                mainCTA: {
                    text: 'Visitar Loja',
                    url: 'http://localhost:3000/products'
                }
            });

            // Add tracking pixel
            const finalContent = campaignEmail.replace('{{trackingPixel}}', trackingPixel);

            const info = await transporter.sendMail({
                from: '"Loja Fashion" <newsletter@loja.com>',
                to,
                subject,
                html: finalContent,
                text: plainTextContent || this.htmlToText(finalContent)
            });

            console.log('Campaign email enviado para %s: %s', to, info.messageId);
            console.log('Visualiza em: %s', nodemailer.getTestMessageUrl(info));
            return info;
        } catch (error) {
            console.error('Error sending campaign email:', error);
            throw error;
        }
    }

    async sendPromotionalEmail(
        to: string,
        firstName: string,
        promotion: {
            title: string;
            description: string;
            discountCode?: string;
            expiration?: string;
            featuredProducts?: Array<{
                name: string;
                price: string;
                image: string;
                url: string;
            }>;
        }
    ) {
        try {
            const htmlContent = await this.templateService.createCampaignEmail({
                title: promotion.title,
                content: promotion.description,
                firstName,
                email: to,
                discount: promotion.discountCode ? {
                    title: 'Oferta Especial',
                    description: promotion.description,
                    code: promotion.discountCode,
                    expiration: promotion.expiration || 'Válido por tempo limitado',
                    ctaUrl: 'http://localhost:3000/products'
                } : undefined,
                featuredProducts: promotion.featuredProducts,
                mainCTA: {
                    text: 'Ver Promoção',
                    url: 'http://localhost:3000/products'
                }
            });

            const info = await transporter.sendMail({
                from: '"Loja Fashion" <newsletter@loja.com>',
                to,
                subject: promotion.title,
                html: htmlContent,
                text: this.htmlToText(htmlContent)
            });

            console.log('Promotional email enviado: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending promotional email:', error);
            throw error;
        }
    }

    async sendAbandonedCartEmail(
        to: string,
        firstName: string,
        cartItems: Array<{
            name: string;
            price: string;
            image: string;
            url: string;
        }>
    ) {
        try {
            const htmlContent = await this.templateService.createCampaignEmail({
                title: 'Esqueceste-te de algo? 🛒',
                content: `
          <p>Olá ${firstName}!</p>
          <p>Notámos que deixaste alguns itens no teu carrinho. Que tal finalizares a compra?</p>
          <p>Os teus itens estão à tua espera e podem esgotar a qualquer momento!</p>
        `,
                firstName,
                email: to,
                featuredProducts: cartItems,
                mainCTA: {
                    text: 'Finalizar Compra',
                    url: 'http://localhost:3000/cart'
                },
                tips: 'Lembra-te: oferta de portes grátis para compras superiores a 50€!'
            });

            const info = await transporter.sendMail({
                from: '"Loja Fashion" <newsletter@loja.com>',
                to,
                subject: 'Esqueceste-te de algo no teu carrinho? 🛒',
                html: htmlContent,
                text: this.htmlToText(htmlContent)
            });

            console.log('Abandoned cart email enviado: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending abandoned cart email:', error);
            throw error;
        }
    }

    private htmlToText(html: string): string {
        // Simple HTML to text conversion
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/?(p|div|h[1-6])\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    /**
     * Test email configuration
     */
    async testConnection(): Promise<boolean> {
        try {
            await transporter.verify();
            console.log('Email server connection successful');
            return true;
        } catch (error) {
            console.error('Email server connection failed:', error);
            return false;
        }
    }

    /**
     * Get email service status
     */
    getStatus() {
        return {
            service: 'Ethereal Email (Test)',
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.ETHEREAL_USER ? '***' : 'NOT_SET',
                pass: process.env.ETHEREAL_PASS ? '***' : 'NOT_SET'
            }
        };
    }
}

// Legacy function for backward compatibility
export async function sendPasswordResetEmail(to: string, token: string) {
    const emailService = new EmailService();
    return emailService.sendPasswordResetEmail(to, token);
}