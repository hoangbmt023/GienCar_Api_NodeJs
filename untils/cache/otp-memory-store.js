const store = new Map(); // email -> otp object

function save(email, otp) {
  store.set(email, otp);
}

function get(email) {
  return store.get(email);
}

function remove(email) {
  store.delete(email);
}

module.exports = {
  save,
  get,
  remove,
};
