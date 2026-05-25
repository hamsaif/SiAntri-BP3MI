require("dotenv").config();

module.exports = {
  CREATE_ANTRIAN:
    process.env.MSG_CREATE_ANTRIAN || "Antrian berhasil dibuat",

  GET_ALL:
    process.env.MSG_GET_ALL || "Data antrian berhasil diambil",

  GET_BY_DATE:
    process.env.MSG_GET_BY_DATE || "Data antrian berdasarkan tanggal",

  SERVER_ERROR:
    process.env.MSG_SERVER_ERROR || "Server error"
};