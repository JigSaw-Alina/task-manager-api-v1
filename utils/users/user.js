const User = require("../../models/user.model");

exports.searchUser = async (query) => {
  const systemUser = await User.findOne(query).select("+password");

  if (systemUser) return { user: systemUser, Collection: User };

  return { user: null, Collection: null };
};
