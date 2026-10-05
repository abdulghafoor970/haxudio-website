const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const serviceRoutes = require('./serviceRoutes');
const adminServiceRoutes = require('./adminServiceRoutes');
const projectRoutes = require('./projectRoutes');
const adminProjectRoutes = require('./adminProjectRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const adminTestimonialRoutes = require('./adminTestimonialRoutes');
const teamRoutes = require('./teamRoutes');
const adminTeamRoutes = require('./adminTeamRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const adminInquiryRoutes = require('./adminInquiryRoutes');
const contentRoutes = require('./contentRoutes');
const adminContentRoutes = require('./adminContentRoutes');
const settingsRoutes = require('./settingsRoutes');
const adminSettingsRoutes = require('./adminSettingsRoutes');
const adminMediaRoutes = require('./adminMediaRoutes');

// Mount public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/projects', projectRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/content', contentRoutes);
router.use('/settings', settingsRoutes);

// Mount admin protected routes
router.use('/admin/services', adminServiceRoutes);
router.use('/admin/projects', adminProjectRoutes);
router.use('/admin/testimonials', adminTestimonialRoutes);
router.use('/admin/team', adminTeamRoutes);
router.use('/admin/inquiries', adminInquiryRoutes);
router.use('/admin/content', adminContentRoutes);
router.use('/admin/settings', adminSettingsRoutes);
router.use('/admin/media', adminMediaRoutes);

module.exports = router;
