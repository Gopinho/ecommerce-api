import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { EmailService } from '../services/email.service';

const prisma = new PrismaClient();
const emailService = new EmailService();

// === SUBSCRIPTION MANAGEMENT ===

/**
 * Subscribe to newsletter
 */
export const subscribe = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, firstName, lastName, preferences, source } = req.body;

        // Check if already subscribed
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already subscribed'
                });
            } else {
                // Reactivate subscription
                const updatedSubscriber = await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: {
                        isActive: true,
                        firstName: firstName || existingSubscriber.firstName,
                        lastName: lastName || existingSubscriber.lastName,
                        preferences: preferences || existingSubscriber.preferences,
                        source: source || existingSubscriber.source,
                        unsubscribedAt: null,
                        subscribedAt: new Date()
                    }
                });

                // Send welcome email
                await emailService.sendWelcomeEmail(
                    updatedSubscriber.email,
                    updatedSubscriber.firstName || 'Subscriber'
                );

                return res.status(200).json({
                    success: true,
                    message: 'Successfully resubscribed',
                    data: {
                        id: updatedSubscriber.id,
                        email: updatedSubscriber.email,
                        firstName: updatedSubscriber.firstName,
                        lastName: updatedSubscriber.lastName
                    }
                });
            }
        }

        // Create new subscription
        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email,
                firstName,
                lastName,
                preferences: preferences || {
                    frequency: 'weekly',
                    categories: ['general', 'new-arrivals', 'sales']
                },
                source: source || 'website',
                isActive: true
            }
        });

        // Send welcome email
        await emailService.sendWelcomeEmail(
            subscriber.email,
            subscriber.firstName || 'Subscriber'
        );

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: {
                id: subscriber.id,
                email: subscriber.email,
                firstName: subscriber.firstName,
                lastName: subscriber.lastName
            }
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe to newsletter'
        });
    }
};

/**
 * Unsubscribe from newsletter
 */
export const unsubscribe = async (req: Request, res: Response) => {
    try {
        const { email, token } = req.body;

        if (!email && !token) {
            return res.status(400).json({
                success: false,
                message: 'Email or unsubscribe token required'
            });
        }

        let whereClause: any = {};
        if (email) {
            whereClause.email = email;
        } else if (token) {
            whereClause.id = token;
        }

        const subscriber = await prisma.newsletterSubscriber.findFirst({
            where: whereClause
        });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        if (!subscriber.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Email is already unsubscribed'
            });
        }

        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                isActive: false,
                unsubscribedAt: new Date()
            }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });

    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe from newsletter'
        });
    }
};

/**
 * Update newsletter preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
    try {
        const { email, preferences } = req.body;

        if (!email || !preferences) {
            return res.status(400).json({
                success: false,
                message: 'Email and preferences are required'
            });
        }

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        const updatedSubscriber = await prisma.newsletterSubscriber.update({
            where: { email },
            data: {
                preferences: {
                    ...subscriber.preferences as any,
                    ...preferences
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                id: updatedSubscriber.id,
                email: updatedSubscriber.email,
                preferences: updatedSubscriber.preferences
            }
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
};

/**
 * Get all subscribers with filtering and pagination
 */
export const getSubscribers = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            isActive,
            source,
            sortBy = 'subscribedAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (source) {
            where.source = source;
        }

        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true
                        }
                    },
                    campaigns: {
                        take: 5,
                        orderBy: { sentAt: 'desc' },
                        include: {
                            campaign: {
                                select: {
                                    id: true,
                                    name: true,
                                    subject: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { [sortBy as string]: sortOrder }
            }),
            prisma.newsletterSubscriber.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: {
                subscribers: subscribers.map(sub => ({
                    ...sub,
                    tags: sub.tags.map(t => t.tag),
                    recentCampaigns: sub.campaigns
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers'
        });
    }
};

/**
 * Create newsletter campaign
 */
export const createCampaign = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            name,
            subject,
            content,
            plainText,
            type = 'GENERAL',
            targetTags = [],
            scheduledFor
        } = req.body;

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const campaign = await prisma.newsletterCampaign.create({
            data: {
                name,
                subject,
                content,
                plainText,
                type,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                createdBy: userId,
                tags: {
                    create: targetTags.map((tagId: string) => ({
                        tagId
                    }))
                }
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true, lastName: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: campaign
        });

    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create campaign'
        });
    }
};

/**
 * Get campaigns list
 */
export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (type) {
            where.type = type;
        }

        const [campaigns, total] = await Promise.all([
            prisma.newsletterCampaign.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            firstName: true, lastName: true,
                            email: true
                        }
                    },
                    tags: {
                        include: {
                            tag: true
                        }
                    },
                    _count: {
                        select: {
                            sent: true
                        }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { [sortBy as string]: sortOrder }
            }),
            prisma.newsletterCampaign.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: {
                campaigns,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns'
        });
    }
};

/**
 * Get campaign details
 */
export const getCampaignDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.newsletterCampaign.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true, lastName: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                sent: {
                    include: {
                        subscriber: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.status(200).json({
            success: true,
            data: campaign
        });

    } catch (error) {
        console.error('Get campaign details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign details'
        });
    }
};

/**
 * Send newsletter campaign
 */
export const sendCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.newsletterCampaign.findUnique({
            where: { id },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
            return res.status(400).json({
                success: false,
                message: 'Campaign cannot be sent in current status'
            });
        }

        // Get target subscribers
        const targetTagIds = campaign.tags.map(t => t.tag.id);
        let whereClause: any = {
            isActive: true
        };

        if (targetTagIds.length > 0) {
            whereClause.tags = {
                some: {
                    tagId: {
                        in: targetTagIds
                    }
                }
            };
        }

        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: whereClause
        });

        // Update campaign status
        await prisma.newsletterCampaign.update({
            where: { id },
            data: {
                status: 'SENDING',
                sentAt: new Date()
            }
        });

        // Send emails
        let sentCount = 0;
        let errorCount = 0;

        for (const subscriber of subscribers) {
            try {
                const alreadySent = await prisma.newsletterCampaignSent.findUnique({
                    where: {
                        campaignId_subscriberId: {
                            campaignId: campaign.id,
                            subscriberId: subscriber.id
                        }
                    }
                });

                if (!alreadySent) {
                    await emailService.sendCampaignEmail(
                        subscriber.email,
                        campaign.subject,
                        campaign.content,
                        campaign.plainText || '',
                        {
                            campaignId: campaign.id,
                            subscriberId: subscriber.id,
                            firstName: subscriber.firstName || 'Subscriber'
                        }
                    );

                    await prisma.newsletterCampaignSent.create({
                        data: {
                            campaignId: campaign.id,
                            subscriberId: subscriber.id
                        }
                    });

                    sentCount++;
                }
            } catch (emailError) {
                console.error(`Failed to send to ${subscriber.email}:`, emailError);
                errorCount++;
            }
        }

        await prisma.newsletterCampaign.update({
            where: { id },
            data: {
                status: 'SENT',
                totalSent: sentCount
            }
        });

        res.status(200).json({
            success: true,
            message: `Campaign sent successfully to ${sentCount} subscribers`,
            data: {
                sentCount,
                errorCount,
                totalSubscribers: subscribers.length
            }
        });

    } catch (error) {
        console.error('Send campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send campaign'
        });
    }
};

/**
 * Cancel campaign
 */
export const cancelCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.newsletterCampaign.findUnique({
            where: { id }
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status === 'SENT') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a campaign that has already been sent'
            });
        }

        await prisma.newsletterCampaign.update({
            where: { id },
            data: {
                status: 'CANCELLED'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Campaign cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel campaign'
        });
    }
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.newsletterCampaign.findUnique({
            where: { id },
            include: {
                sent: true
            }
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const stats = {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            sentAt: campaign.sentAt,
            totalSent: campaign.totalSent,
            opened: campaign.sent.filter((s: any) => s.openedAt).length,
            clicked: campaign.sent.filter((s: any) => s.clickedAt).length,
            bounced: campaign.sent.filter((s: any) => s.bouncedAt).length,
            unsubscribed: campaign.sent.filter((s: any) => s.unsubscribedAt).length,
            openRate: campaign.totalSent > 0 ?
                (campaign.sent.filter((s: any) => s.openedAt).length / campaign.totalSent * 100).toFixed(2) : '0',
            clickRate: campaign.totalSent > 0 ?
                (campaign.sent.filter((s: any) => s.clickedAt).length / campaign.totalSent * 100).toFixed(2) : '0'
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get campaign stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign statistics'
        });
    }
};

// === EMAIL TRACKING ===

/**
 * Track email open
 */
export const trackEmailOpen = async (req: Request, res: Response) => {
    try {
        const { campaignId, subscriberId } = req.params;

        await prisma.newsletterCampaignSent.updateMany({
            where: {
                campaignId,
                subscriberId,
                openedAt: null
            },
            data: {
                openedAt: new Date()
            }
        });

        // Return a 1x1 transparent pixel
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.setHeader('Content-Type', 'image/gif');
        res.setHeader('Content-Length', pixel.length);
        res.send(pixel);

    } catch (error) {
        console.error('Track email open error:', error);
        res.status(500).send('Error');
    }
};

/**
 * Track email click
 */
export const trackEmailClick = async (req: Request, res: Response) => {
    try {
        const { campaignId, subscriberId } = req.params;
        const { url } = req.query;

        await prisma.newsletterCampaignSent.updateMany({
            where: {
                campaignId,
                subscriberId
            },
            data: {
                clickedAt: new Date()
            }
        });

        if (url) {
            res.redirect(url as string);
        } else {
            res.status(200).json({ success: true });
        }

    } catch (error) {
        console.error('Track email click error:', error);
        res.status(500).json({ success: false, message: 'Error tracking click' });
    }
};

// === TEMPLATE MANAGEMENT ===

/**
 * Create newsletter template
 */
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { name, description, content, variables, type = 'GENERAL' } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const template = await prisma.newsletterTemplate.create({
            data: {
                name,
                description,
                content,
                variables,
                type,
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: template
        });

    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template'
        });
    }
};

/**
 * Get templates
 */
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const { type, isActive = true } = req.query;

        const where: any = { isActive: isActive === 'true' };
        if (type) {
            where.type = type;
        }

        const templates = await prisma.newsletterTemplate.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true, lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: templates
        });

    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates'
        });
    }
};

/**
 * Update template
 */
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, content, variables, type, isActive } = req.body;

        const template = await prisma.newsletterTemplate.update({
            where: { id },
            data: {
                name,
                description,
                content,
                variables,
                type,
                isActive
            }
        });

        res.status(200).json({
            success: true,
            message: 'Template updated successfully',
            data: template
        });

    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template'
        });
    }
};

/**
 * Delete template
 */
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.newsletterTemplate.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template'
        });
    }
};

// === TAG MANAGEMENT ===

/**
 * Create tag
 */
export const createTag = async (req: Request, res: Response) => {
    try {
        const { name, color } = req.body;

        const tag = await prisma.newsletterTag.create({
            data: {
                name,
                color
            }
        });

        res.status(201).json({
            success: true,
            message: 'Tag created successfully',
            data: tag
        });

    } catch (error) {
        console.error('Create tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tag'
        });
    }
};

/**
 * Get tags
 */
export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await prisma.newsletterTag.findMany({
            include: {
                _count: {
                    select: {
                        subscribers: true,
                        campaigns: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({
            success: true,
            data: tags
        });

    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tags'
        });
    }
};

/**
 * Update tag
 */
export const updateTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        const tag = await prisma.newsletterTag.update({
            where: { id },
            data: {
                name,
                color
            }
        });

        res.status(200).json({
            success: true,
            message: 'Tag updated successfully',
            data: tag
        });

    } catch (error) {
        console.error('Update tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tag'
        });
    }
};

/**
 * Delete tag
 */
export const deleteTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.newsletterTag.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Tag deleted successfully'
        });

    } catch (error) {
        console.error('Delete tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete tag'
        });
    }
};

/**
 * Add tag to subscriber
 */
export const addTagToSubscriber = async (req: Request, res: Response) => {
    try {
        const { subscriberId, tagId } = req.params;

        const existing = await prisma.newsletterSubscriberTag.findUnique({
            where: {
                subscriberId_tagId: {
                    subscriberId,
                    tagId
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Tag already assigned to subscriber'
            });
        }

        await prisma.newsletterSubscriberTag.create({
            data: {
                subscriberId,
                tagId
            }
        });

        res.status(200).json({
            success: true,
            message: 'Tag added to subscriber successfully'
        });

    } catch (error) {
        console.error('Add tag to subscriber error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add tag to subscriber'
        });
    }
};

/**
 * Remove tag from subscriber
 */
export const removeTagFromSubscriber = async (req: Request, res: Response) => {
    try {
        const { subscriberId, tagId } = req.params;

        await prisma.newsletterSubscriberTag.delete({
            where: {
                subscriberId_tagId: {
                    subscriberId,
                    tagId
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Tag removed from subscriber successfully'
        });

    } catch (error) {
        console.error('Remove tag from subscriber error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove tag from subscriber'
        });
    }
};