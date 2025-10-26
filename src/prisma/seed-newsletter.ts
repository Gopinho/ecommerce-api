import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const newsletterTemplates = [
    {
        name: 'Boas-vindas',
        description: 'Template de email de boas-vindas para novos subscritores',
        type: 'WELCOME' as const,
        content: `
      <h1 style="color: #007cba; margin-bottom: 20px;">Bem-vindo à nossa comunidade, {{firstName}}! 🎉</h1>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Obrigado por te juntares à nossa newsletter! Estamos muito entusiasmados por te ter connosco.
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #333; margin-top: 0;">O que podes esperar de nós:</h3>
        <ul style="color: #666; line-height: 1.8;">
          <li><strong>🆕 Novidades:</strong> Novos produtos em primeira mão</li>
          <li><strong>💰 Ofertas exclusivas:</strong> Descontos especiais</li>
          <li><strong>👗 Dicas de moda:</strong> Conselhos e tendências</li>
          <li><strong>🎪 Eventos especiais:</strong> Convites exclusivos</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{shopUrl}}" style="background: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver Novidades</a>
      </div>
      
      <div style="background: linear-gradient(135deg, #007cba, #005a87); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <h3 style="margin-top: 0; color: white;">🎁 Oferta de Boas-Vindas</h3>
        <p style="margin-bottom: 15px;">Oferecemos-te <strong>10% de desconto</strong> na tua primeira compra!</p>
        <p style="font-size: 18px; font-weight: bold; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; display: inline-block;">
          Código: <span style="letter-spacing: 2px;">WELCOME10</span>
        </p>
      </div>
    `,
        variables: {
            firstName: 'Nome do subscritor',
            shopUrl: 'URL da loja',
            discountCode: 'Código de desconto'
        }
    },
    {
        name: 'Novos Produtos',
        description: 'Template para campanhas de novos produtos',
        type: 'NEW_ARRIVALS' as const,
        content: `
      <h1 style="color: #007cba; margin-bottom: 20px;">Acabaram de chegar! ✨</h1>
      
      <p style="font-size: 16px; margin-bottom: 25px;">
        Olá {{firstName}}! Temos novidades incríveis que sabemos que vais adorar.
      </p>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #333; margin-top: 0; text-align: center;">✨ Novos Produtos</h3>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">
          Descobre as últimas tendências que acabaram de chegar à nossa loja
        </p>
        <div style="text-align: center;">
          <a href="{{newArrivalsUrl}}" style="background: #007cba; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver Novidades</a>
        </div>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">
        <strong>Dica:</strong> Os tamanhos mais populares esgotam rapidamente. Não percas tempo!
      </p>
    `,
        variables: {
            firstName: 'Nome do subscritor',
            newArrivalsUrl: 'URL dos novos produtos'
        }
    },
    {
        name: 'Promoção',
        description: 'Template para campanhas promocionais',
        type: 'PROMOTIONAL' as const,
        content: `
      <h1 style="color: #007cba; margin-bottom: 20px;">{{promotionTitle}} 🔥</h1>
      
      <p style="font-size: 16px; margin-bottom: 25px;">
        Olá {{firstName}}! Temos uma oferta especial que não podes perder.
      </p>
      
      <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <h2 style="margin-top: 0; color: white; font-size: 24px;">{{discountTitle}}</h2>
        <p style="font-size: 18px; margin-bottom: 20px;">{{discountDescription}}</p>
        
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 20px; font-weight: bold; margin: 0;">
            Código: <span style="letter-spacing: 3px; font-size: 24px;">{{discountCode}}</span>
          </p>
        </div>
        
        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 20px;">{{expirationText}}</p>
        
        <a href="{{shopUrl}}" style="background: white; color: #dc3545; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Usar Desconto Agora
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">
        Esta promoção é válida apenas para subscritores da newsletter. Partilha com os teus amigos!
      </p>
    `,
        variables: {
            firstName: 'Nome do subscritor',
            promotionTitle: 'Título da promoção',
            discountTitle: 'Título do desconto',
            discountDescription: 'Descrição do desconto',
            discountCode: 'Código do desconto',
            expirationText: 'Texto de expiração',
            shopUrl: 'URL da loja'
        }
    },
    {
        name: 'Carrinho Abandonado',
        description: 'Template para recuperar carrinhos abandonados',
        type: 'ABANDONED_CART' as const,
        content: `
      <h1 style="color: #007cba; margin-bottom: 20px;">Esqueceste-te de algo? 🛒</h1>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Olá {{firstName}}! Notámos que deixaste alguns itens incríveis no teu carrinho.
      </p>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #856404; margin-top: 0;">⏰ Não percas esta oportunidade!</h3>
        <p style="color: #856404; margin-bottom: 0;">
          Os teus itens estão à tua espera, mas podem esgotar a qualquer momento. 
          Finaliza a compra agora e garante as tuas escolhas!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{cartUrl}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          Finalizar Compra
        </a>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <h4 style="color: #333; margin-top: 0;">🚚 Portes Grátis</h4>
        <p style="color: #666; margin-bottom: 0;">
          Para compras superiores a {{freeShippingAmount}}
        </p>
      </div>
    `,
        variables: {
            firstName: 'Nome do subscritor',
            cartUrl: 'URL do carrinho',
            freeShippingAmount: 'Valor para portes grátis'
        }
    },
    {
        name: 'Época Sazonal',
        description: 'Template para campanhas sazonais',
        type: 'SEASONAL' as const,
        content: `
      <h1 style="color: #007cba; margin-bottom: 20px;">{{seasonTitle}} 🌟</h1>
      
      <p style="font-size: 16px; margin-bottom: 25px;">
        Olá {{firstName}}! {{seasonDescription}}
      </p>
      
      <div style="background: linear-gradient(135deg, {{seasonColor1}}, {{seasonColor2}}); color: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <h2 style="margin-top: 0; color: white;">{{collectionTitle}}</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">{{collectionDescription}}</p>
        
        <a href="{{collectionUrl}}" style="background: rgba(255,255,255,0.2); color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid white;">
          Ver Coleção
        </a>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="color: #333; margin-top: 0; text-align: center;">{{trendTitle}}</h4>
        <p style="color: #666; text-align: center; margin-bottom: 15px;">{{trendDescription}}</p>
        <div style="text-align: center;">
          <a href="{{trendsUrl}}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Tendências</a>
        </div>
      </div>
    `,
        variables: {
            firstName: 'Nome do subscritor',
            seasonTitle: 'Título da época',
            seasonDescription: 'Descrição da época',
            seasonColor1: 'Cor 1 do gradiente',
            seasonColor2: 'Cor 2 do gradiente',
            collectionTitle: 'Título da coleção',
            collectionDescription: 'Descrição da coleção',
            collectionUrl: 'URL da coleção',
            trendTitle: 'Título das tendências',
            trendDescription: 'Descrição das tendências',
            trendsUrl: 'URL das tendências'
        }
    }
];

async function seedNewsletterTemplates() {
    console.log('🌱 A semear templates de newsletter...');

    try {
        // Find an admin user to assign as creator
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!adminUser) {
            console.log('❌ Nenhum utilizador admin encontrado. A criar utilizador admin...');
            const createdAdmin = await prisma.user.create({
                data: {
                    email: 'admin@loja.com',
                    password: '$2b$10$placeholder', // In real app, this should be properly hashed
                    name: 'Administrador',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Utilizador admin criado');
        }

        const creatorId = adminUser?.id || (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))!.id;

        // Delete existing templates
        await (prisma as any).newsletterTemplate.deleteMany({});
        console.log('🗑️ Templates existentes removidos');

        // Create new templates
        for (const template of newsletterTemplates) {
            await (prisma as any).newsletterTemplate.create({
                data: {
                    ...template,
                    createdBy: creatorId
                }
            });
            console.log(`✅ Template "${template.name}" criado`);
        }

        // Create some basic tags
        const basicTags = [
            { name: 'VIP', color: '#FFD700' },
            { name: 'Novos Clientes', color: '#28a745' },
            { name: 'Clientes Frequentes', color: '#007cba' },
            { name: 'Interessados em Promoções', color: '#dc3545' },
            { name: 'Fashion Lovers', color: '#6f42c1' },
            { name: 'Abandonou Carrinho', color: '#fd7e14' }
        ];

        await (prisma as any).newsletterTag.deleteMany({});
        console.log('🗑️ Tags existentes removidas');

        for (const tag of basicTags) {
            await (prisma as any).newsletterTag.create({
                data: tag
            });
            console.log(`✅ Tag "${tag.name}" criada`);
        }

        console.log('🎉 Seed de newsletter templates concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao semear templates:', error);
        throw error;
    }
}

// Execute if run directly
if (require.main === module) {
    seedNewsletterTemplates()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export default seedNewsletterTemplates;