const service = require("../services/antrian.service");
const response = require("../utils/response");
const msg = require("../constants/message");


// service buat antrian
exports.create = async (req, res) => {
  try {
    const result = await service.create(req.body);
    console.log(result);

    return response.success(
      res,
      result,
      msg.CREATE_ANTRIAN,
    );

  } catch (err) {
    return response.error(
      res,
      err.message || msg.SERVER_ERROR,
      err.status || 500,
      err.errors || null
    );
  }
};


// service ambil semua antrian
exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll();

    return response.success(
      res,
      data,
      msg.GET_ALL,
      {
        total_tanggal: Object.keys(data).length,
        total_antrian: Object.values(data).flat().length
      }
    );

  } catch (err) {
    return response.error(
      res,
      err.message || msg.SERVER_ERROR
    );
  }
};


// service ambil antrian berdasarkan tanggal
exports.getByTanggal = async (req, res) => {
  try {
    const data = await service.getByTanggal(req.params.tgl);

    return response.success(
      res,
      data,
      msg.GET_BY_DATE
    );

  } catch (err) {
    return response.error(
      res,
      err.message || msg.SERVER_ERROR
    );
  }
};