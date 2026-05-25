const requests = {};

module.exports = (req, res, next) => {

  const now = Date.now();

  // identifier request
  const key = `${req.body.nama}-${req.body.hp}-${req.body.skema}`;

  // cek request sebelumnya
  if (
    requests[key] &&
    now - requests[key] < 3000
  ) {
    return res.status(429).json({
      success: false,
      message: "Terlalu banyak request",
      data: null,
      metadata: {},
      errors: null
    });
  }

  // simpan waktu request
  requests[key] = now;

  next();
};