const mongoose = require('mongoose');

const familySchema = new mongoose.Schema(
  {
    familyName: {
      type: String,
      required: true,
      trim: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 6,
      uppercase: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Family', familySchema);
