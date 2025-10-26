import { Router } from 'express';
import {
    subscribe,
    unsubscribe,
    updatePreferences,
    getSubscribers,
    createCampaign,
    sendCampaign,
    getCampaignStats,
    cancelCampaign,
    getCampaigns,
    getCampaignDetails,
    trackEmailOpen,
    trackEmailClick,
    createTemplate,
    getTemplates,
    updateTemplate,
    deleteTemplate,
    createTag,
    getTags,
    updateTag,
    deleteTag,
    addTagToSubscriber,
    removeTagFromSubscriber
} from '../controllers/newsletter.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// === PUBLIC ROUTES ===

// Subscription management
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.put('/preferences', updatePreferences);

// Email tracking (public endpoints for email links)
router.get('/track/open/:campaignId/:subscriberId', trackEmailOpen);
router.get('/track/click/:campaignId/:subscriberId', trackEmailClick);

// === ADMIN ROUTES ===

// Subscriber management
router.get('/subscribers', authenticate, authorizeRole('ADMIN', 'MANAGER'), getSubscribers);

// Campaign management
router.post('/campaigns', authenticate, authorizeRole('ADMIN', 'MANAGER'), createCampaign);
router.get('/campaigns', authenticate, authorizeRole('ADMIN', 'MANAGER'), getCampaigns);
router.get('/campaigns/:id', authenticate, authorizeRole('ADMIN', 'MANAGER'), getCampaignDetails);
router.post('/campaigns/:id/send', authenticate, authorizeRole('ADMIN', 'MANAGER'), sendCampaign);
router.post('/campaigns/:id/cancel', authenticate, authorizeRole('ADMIN', 'MANAGER'), cancelCampaign);
router.get('/campaigns/:id/stats', authenticate, authorizeRole('ADMIN', 'MANAGER'), getCampaignStats);

// Template management
router.post('/templates', authenticate, authorizeRole('ADMIN', 'MANAGER'), createTemplate);
router.get('/templates', authenticate, authorizeRole('ADMIN', 'MANAGER'), getTemplates);
router.put('/templates/:id', authenticate, authorizeRole('ADMIN', 'MANAGER'), updateTemplate);
router.delete('/templates/:id', authenticate, authorizeRole('ADMIN', 'MANAGER'), deleteTemplate);

// Tag management
router.post('/tags', authenticate, authorizeRole('ADMIN', 'MANAGER'), createTag);
router.get('/tags', authenticate, authorizeRole('ADMIN', 'MANAGER'), getTags);
router.put('/tags/:id', authenticate, authorizeRole('ADMIN', 'MANAGER'), updateTag);
router.delete('/tags/:id', authenticate, authorizeRole('ADMIN', 'MANAGER'), deleteTag);

// Subscriber tag management
router.post('/subscribers/:subscriberId/tags/:tagId', authenticate, authorizeRole('ADMIN', 'MANAGER'), addTagToSubscriber);
router.delete('/subscribers/:subscriberId/tags/:tagId', authenticate, authorizeRole('ADMIN', 'MANAGER'), removeTagFromSubscriber);

export default router;