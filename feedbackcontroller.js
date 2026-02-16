const Feedback = require('../models/Feedback');
const Club = require('../models/Club');

/**
 * POST /api/club/:clubId/feedback
 * Member submits new feedback for a club
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const isMember = (club.members || []).some(id => id.toString() === userId);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member of this club' });

    const fb = await Feedback.create({
      club: clubId,
      submittedBy: userId,
      message: message.trim()
    });

    return res.status(201).json({ success: true, feedback: fb });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to submit feedback', error: e.message });
  }
};

/**
 * GET /api/club/:clubId/feedbacks
 * Officer lists all feedbacks for a club
 */
exports.listFeedbacks = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const isOfficer = (club.officers || []).some(id => id.toString() === userId);
    if (!isOfficer) return res.status(403).json({ success: false, message: 'Not authorized' });

    const feedbacks = await Feedback.find({ club: clubId })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email');

    // Shape the payload to match your FeedbackView.js expectations (sender.name/email)
    const shaped = feedbacks.map(f => ({
      _id: f._id,
      message: f.message,
      createdAt: f.createdAt,
      sender: { name: f.submittedBy?.name, email: f.submittedBy?.email }
    }));

    return res.json({ success: true, feedbacks: shaped });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch feedbacks', error: e.message });
  }
};

/**
 * GET /api/club/:clubId/feedbacks/mine
 * Member lists their own feedbacks for a club
 */
exports.listMyFeedbacks = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const isMember = (club.members || []).some(id => id.toString() === userId);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member of this club' });

    const feedbacks = await Feedback.find({ club: clubId, submittedBy: userId })
      .sort({ createdAt: -1 });

    return res.json({ success: true, feedbacks });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your feedbacks', error: e.message });
  }
};

/**
 * PATCH /api/club/:clubId/feedback/:feedbackId
 * Member edits their own feedback for a club
 */
exports.updateFeedback = async (req, res) => {
  try {
    const { clubId, feedbackId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const fb = await Feedback.findOne({ _id: feedbackId, club: clubId, submittedBy: userId });
    if (!fb) {
      return res.status(404).json({ success: false, message: 'Feedback not found or not yours' });
    }

    // Optional: enforce an edit window (e.g., 7 days)
    // const diffDays = (Date.now() - fb.createdAt.getTime()) / (1000*60*60*24);
    // if (diffDays > 7) return res.status(400).json({ success:false, message:'Edit window closed' });

    fb.message = message.trim();
    await fb.save(); // updatedAt auto-updates due to timestamps

    return res.json({ success: true, feedback: fb });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update feedback', error: e.message });
  }
};
