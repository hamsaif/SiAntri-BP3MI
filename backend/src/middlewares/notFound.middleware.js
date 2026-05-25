module.exports = (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
    data: null,
    metadata: {},
    errors: null
  });
};