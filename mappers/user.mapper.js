const toUserAdminResponse = (user) => ({
  id: user._id,
  email: user.email,
  roles: user.roles.map((r) => r.toLowerCase()),
  status: user.status.toLowerCase(),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});


module.exports = { toUserAdminResponse };
