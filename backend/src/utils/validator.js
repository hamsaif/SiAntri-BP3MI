exports.validateAntrian = (data) => {
  const errors = [];

  if (!data.nama || data.nama.length < 3)
    errors.push("Nama tidak valid");

  if (!/^08[0-9]{8,12}$/.test(data.hp || ""))
    errors.push("HP tidak valid");

  return errors;
};