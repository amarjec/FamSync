const Family = require('../models/Family');

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const makeCode = () => {
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
};

const generateUniqueInviteCode = async () => {
  let inviteCode = makeCode();
  let exists = await Family.findOne({ inviteCode });

  while (exists) {
    inviteCode = makeCode();
    exists = await Family.findOne({ inviteCode });
  }

  return inviteCode;
};

module.exports = generateUniqueInviteCode;
