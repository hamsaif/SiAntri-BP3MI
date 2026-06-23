exports.validateAntrian = (data) => {
  const errors = [];

  if (!data.nama || data.nama.length < 3)
    errors.push("Nama tidak valid");

  if (!/^08[0-9]{8,12}$/.test(data.hp || ""))
    errors.push("HP tidak valid");

  if (data.paspor && !/^[A-Za-z0-9]{9}$/.test(data.paspor)) {
    errors.push("Nomor paspor harus terdiri dari 9 karakter")
  }

  return errors;
};