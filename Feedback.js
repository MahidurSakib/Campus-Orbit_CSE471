const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

// Helpful indexes for your queries
FeedbackSchema.index({ club: 1, createdAt: -1 });
FeedbackSchema.index({ submittedBy: 1, club: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
