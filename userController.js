const User = require('../models/User');
const Club = require('../models/Club');

exports.getUserInvitations = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const invitations = await Club.find({ _id: { $in: user.clubsInvited } }).select('name description');

    res.json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};

exports.getJoinedClubs = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'No user info in token', tokenUser: req.user });
    }
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', userId });
    }
    if (!user.clubsJoined || user.clubsJoined.length === 0) {
      return res.json({ success: true, clubs: [], info: 'No clubs joined for this user.' });
    }
    const clubs = await Club.find({ _id: { $in: user.clubsJoined } }).select('name description');
    res.json({ success: true, clubs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch joined clubs', error: error.message });
  }
};

