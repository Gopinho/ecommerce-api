import PDFDocument from 'pdfkit';
import prisma from '../prisma/client';
import fs from 'fs';
import path from 'path';
import { decimalToNumber } from '../utils/decimal';

export async function generateInvoice(orderId: string): Promise<string> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { include: { product: true } }, // 'items' é o nome correto da relação
            user: true,
            coupon: true,
        },
    });

    if (!order) throw new Error('invoice.order_not_found');

    const subtotal = order.items.reduce((sum, item) => sum + decimalToNumber(item.price) * item.quantity, 0);
    let discount = 0;
    if (order.coupon) {
        discount = order.coupon.discountType === 'percent'
            ? subtotal * (decimalToNumber(order.coupon.amount) / 100)
            : decimalToNumber(order.coupon.amount);
    }
    const total = subtotal - discount;

    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join('invoices', `invoice_${order.id}.pdf`);

    // Garante que a pasta invoices existe
    fs.mkdirSync('invoices', { recursive: true });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Client: ${order.user.name} (${order.user.email})`);
    doc.text(`Date: ${order.createdAt.toISOString().split('T')[0]}`);
    doc.moveDown();

    doc.text('Products:', { underline: true });
    order.items.forEach((item) => {
        const itemPrice = decimalToNumber(item.product.price);
        doc.text(
            `${item.product.name} - €${itemPrice.toFixed(2)} x ${item.quantity} = €${(itemPrice * item.quantity).toFixed(2)}`
        );
    });

    doc.moveDown();
    if (order.coupon) {
        doc.text(`Coupon Aplied: ${order.coupon.code} (-€${discount.toFixed(2)})`);
    }

    doc.fontSize(14).text(`Total: €${total.toFixed(2)}`, { align: 'right' });

    doc.end();

    // Espera terminar de escrever
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
}