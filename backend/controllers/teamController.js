const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * PUBLIC: Get all published team members
 * Only returns isPublished: true, sorted by displayOrder asc
 */
exports.getPublicTeam = async (req, res) => {
  try {
    const members = await TeamMember.find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (err) {
    console.error('[Public Team Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve published team members',
    });
  }
};

/**
 * ADMIN: Get all team members + metrics (total, published, drafts)
 */
exports.getAdminTeam = async (req, res) => {
  try {
    const members = await TeamMember.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean({ virtuals: true });

    const total = members.length;
    const published = members.filter((m) => m.isPublished).length;
    const drafts = total - published;

    return res.status(200).json({
      success: true,
      total,
      published,
      drafts,
      data: members,
    });
  } catch (err) {
    console.error('[Admin Team Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve team members list',
    });
  }
};

/**
 * ADMIN: Get single team member by ID
 */
exports.getAdminTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (err) {
    console.error('[Admin Get Team Member Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve team member',
    });
  }
};

/**
 * ADMIN: Create new team member
 */
exports.createTeamMember = async (req, res) => {
  try {
    const {
      name,
      position,
      role,
      discipline,
      bio,
      photo,
      image,
      photoAlt,
      badge,
      highlight,
      location,
      email,
      linkedin,
      x,
      instagram,
      facebook,
      github,
      portfolioUrl,
      socials,
      isPublished,
      displayOrder,
    } = req.body;

    const memberName = (name || '').trim();
    const memberPosition = (position || role || '').trim();

    if (!memberName) {
      return res.status(400).json({
        success: false,
        message: 'Team member name is required',
      });
    }

    if (!memberPosition) {
      return res.status(400).json({
        success: false,
        message: 'Team member role / position is required',
      });
    }

    // Handle nested socials object if passed
    const soc = socials || {};

    const newMember = new TeamMember({
      name: memberName,
      position: memberPosition,
      discipline: (discipline || '').trim(),
      bio: (bio || '').trim(),
      photo: (photo || image || '').trim(),
      photoAlt: (photoAlt || '').trim(),
      badge: (badge || '').trim(),
      highlight: (highlight || '').trim(),
      location: (location || 'Quetta, Balochistan').trim(),
      email: (email || '').trim(),
      linkedin: (linkedin || soc.linkedin || '').trim(),
      x: (x || soc.x || '').trim(),
      instagram: (instagram || soc.instagram || '').trim(),
      facebook: (facebook || soc.facebook || '').trim(),
      github: (github || soc.github || '').trim(),
      portfolioUrl: (portfolioUrl || soc.portfolioUrl || '').trim(),
      isPublished: typeof isPublished === 'boolean' ? isPublished : true,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
    });

    await newMember.save();

    return res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: newMember,
    });
  } catch (err) {
    console.error('[Admin Create Team Member Error]:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to create team member',
    });
  }
};

/**
 * ADMIN: Update existing team member
 */
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    if (req.body.name !== undefined) member.name = req.body.name.trim();

    if (req.body.position !== undefined) member.position = req.body.position.trim();
    if (req.body.role !== undefined && req.body.position === undefined) member.position = req.body.role.trim();

    if (req.body.discipline !== undefined) member.discipline = req.body.discipline.trim();
    if (req.body.bio !== undefined) member.bio = req.body.bio.trim();

    if (req.body.photo !== undefined) member.photo = req.body.photo.trim();
    if (req.body.image !== undefined && req.body.photo === undefined) member.photo = req.body.image.trim();

    if (req.body.photoAlt !== undefined) member.photoAlt = req.body.photoAlt.trim();
    if (req.body.badge !== undefined) member.badge = req.body.badge.trim();
    if (req.body.highlight !== undefined) member.highlight = req.body.highlight.trim();
    if (req.body.location !== undefined) member.location = req.body.location.trim();
    if (req.body.email !== undefined) member.email = req.body.email.trim();

    // Social links
    const soc = req.body.socials || {};
    if (req.body.linkedin !== undefined) member.linkedin = req.body.linkedin.trim();
    else if (soc.linkedin !== undefined) member.linkedin = soc.linkedin.trim();

    if (req.body.x !== undefined) member.x = req.body.x.trim();
    else if (soc.x !== undefined) member.x = soc.x.trim();

    if (req.body.instagram !== undefined) member.instagram = req.body.instagram.trim();
    else if (soc.instagram !== undefined) member.instagram = soc.instagram.trim();

    if (req.body.facebook !== undefined) member.facebook = req.body.facebook.trim();
    else if (soc.facebook !== undefined) member.facebook = soc.facebook.trim();

    if (req.body.github !== undefined) member.github = req.body.github.trim();
    else if (soc.github !== undefined) member.github = soc.github.trim();

    if (req.body.portfolioUrl !== undefined) member.portfolioUrl = req.body.portfolioUrl.trim();
    else if (soc.portfolioUrl !== undefined) member.portfolioUrl = soc.portfolioUrl.trim();

    if (typeof req.body.isPublished === 'boolean') member.isPublished = req.body.isPublished;
    if (typeof req.body.displayOrder === 'number') member.displayOrder = req.body.displayOrder;

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: member,
    });
  } catch (err) {
    console.error('[Admin Update Team Member Error]:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update team member',
    });
  }
};

/**
 * ADMIN: Quick toggle publish
 */
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    member.isPublished = !member.isPublished;
    await member.save();

    return res.status(200).json({
      success: true,
      message: `Team member ${member.isPublished ? 'published' : 'saved as draft'}`,
      isPublished: member.isPublished,
      data: member,
    });
  } catch (err) {
    console.error('[Admin Toggle Publish Team Member Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle publication status',
    });
  }
};

/**
 * ADMIN: Delete team member
 */
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const member = await TeamMember.findByIdAndDelete(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Team member '${member.name}' deleted successfully`,
    });
  } catch (err) {
    console.error('[Admin Delete Team Member Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete team member',
    });
  }
};
