const store = new Map(); 

const RESEND_SECONDS = 60;

function canSend(email) {
  const lastSent = store.get(email);

  if (!lastSent) {
    return true;
  }

  const now = Date.now();
  const diffSeconds = (now - lastSent) / 1000;

  return diffSeconds >= RESEND_SECONDS;
}

function recordSend(email) {
  store.set(email, Date.now());
}

module.exports = {
  canSend,
  recordSend,
};
