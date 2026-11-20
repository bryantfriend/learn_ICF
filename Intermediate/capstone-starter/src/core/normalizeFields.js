function normalizeFields(payload, normalizers) {
  return Object.keys(normalizers).reduce(function (next, field) {
    next[field] = normalizers[field](payload[field], payload);
    return next;
  }, {
    ...payload
  });
}

module.exports = normalizeFields;
