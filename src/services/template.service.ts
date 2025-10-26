import fs from 'fs';
import path from 'path';

export class TemplateService {
    private templatesPath = path.join(__dirname, '..', 'templates', 'email');

    /**
     * Load and process an email template
     */
    public async loadTemplate(templateName: string, variables: Record<string, any> = {}): Promise<string> {
        try {
            // Load base template
            const basePath = path.join(this.templatesPath, 'base.html');
            const baseTemplate = await fs.promises.readFile(basePath, 'utf-8');

            // Load specific template content
            const contentPath = path.join(this.templatesPath, `${templateName}.html`);
            let contentTemplate = '';

            if (fs.existsSync(contentPath)) {
                contentTemplate = await fs.promises.readFile(contentPath, 'utf-8');
            } else {
                contentTemplate = variables.content || '<p>Conteúdo não disponível</p>';
            }

            // Process content template with variables
            const processedContent = this.processTemplate(contentTemplate, variables);

            // Merge with base template
            const mergedTemplate = this.processTemplate(baseTemplate, {
                ...variables,
                content: processedContent,
                unsubscribeUrl: variables.unsubscribeUrl || `http://localhost:3000/newsletter/unsubscribe?email=${variables.email}`,
                preferencesUrl: variables.preferencesUrl || `http://localhost:3000/newsletter/preferences?email=${variables.email}`,
                trackingPixel: variables.trackingPixel || ''
            });

            return mergedTemplate;

        } catch (error) {
            console.error('Error loading template:', error);
            return this.getFallbackTemplate(variables);
        }
    }

    /**
     * Process template string with variables
     */
    private processTemplate(template: string, variables: Record<string, any>): string {
        let processed = template;

        // Replace simple variables {{variable}}
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            const value = variables[key] || '';
            processed = processed.replace(regex, String(value));
        });

        // Process conditional blocks {{#if condition}}...{{/if}}
        processed = processed.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
            return variables[condition] ? content : '';
        });

        // Process loops {{#each array}}...{{/each}}
        processed = processed.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, itemTemplate) => {
            const array = variables[arrayName];
            if (Array.isArray(array)) {
                return array.map(item => this.processTemplate(itemTemplate, item)).join('');
            }
            return '';
        });

        // Clean up any remaining template syntax
        processed = processed.replace(/\{\{[^}]+\}\}/g, '');

        return processed;
    }

    /**
     * Get available templates
     */
    public async getAvailableTemplates(): Promise<string[]> {
        try {
            const files = await fs.promises.readdir(this.templatesPath);
            return files
                .filter(file => file.endsWith('.html') && file !== 'base.html')
                .map(file => file.replace('.html', ''));
        } catch (error) {
            console.error('Error reading templates directory:', error);
            return [];
        }
    }

    /**
     * Create a welcome email
     */
    public async createWelcomeEmail(firstName: string, email: string): Promise<string> {
        const variables = {
            firstName: firstName || 'Amigo',
            email,
            shopUrl: 'http://localhost:3000/products',
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT')
        };

        return this.loadTemplate('welcome', variables);
    }

    /**
     * Create a campaign email
     */
    public async createCampaignEmail(
        campaignData: {
            title: string;
            content: string;
            firstName: string;
            email: string;
            featuredProducts?: Array<{
                name: string;
                price: string;
                image: string;
                url: string;
            }>;
            mainCTA?: {
                text: string;
                url: string;
            };
            discount?: {
                title: string;
                description: string;
                code?: string;
                expiration?: string;
                ctaUrl?: string;
            };
            additionalContent?: string;
            tips?: string;
        }
    ): Promise<string> {
        const variables = {
            campaignTitle: campaignData.title,
            campaignContent: campaignData.content,
            firstName: campaignData.firstName || 'Amigo',
            email: campaignData.email,
            featuredProducts: campaignData.featuredProducts,
            mainCTA: campaignData.mainCTA,
            discount: campaignData.discount,
            additionalContent: campaignData.additionalContent,
            tips: campaignData.tips
        };

        return this.loadTemplate('campaign', variables);
    }

    /**
     * Fallback template for errors
     */
    private getFallbackTemplate(variables: Record<string, any>): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${variables.subject || 'Loja Fashion'}</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007cba;">Loja Fashion</h1>
                </div>
                
                <div>
                    ${variables.content || '<p>Olá! Obrigado por subscrever a nossa newsletter.</p>'}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
                    <p>Loja Fashion - A sua moda, o nosso estilo</p>
                    <p>
                        Se não quiseres mais receber estes emails, 
                        <a href="http://localhost:3000/newsletter/unsubscribe?email=${variables.email}">cancela a subscrição</a>.
                    </p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate email preview (useful for admin dashboard)
     */
    public async generatePreview(templateName: string, sampleData: Record<string, any>): Promise<string> {
        const sampleVariables = {
            firstName: 'João',
            email: 'joao@exemplo.com',
            subject: 'Email de Teste',
            ...sampleData
        };

        return this.loadTemplate(templateName, sampleVariables);
    }
}