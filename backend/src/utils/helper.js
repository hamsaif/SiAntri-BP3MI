exports.getPrefix = (skema) => {
  if (skema === "SSW Mandiri") return "SSW";
  if (skema === "Mandiri") return "M";
  if (skema === "Cuti") return "C";
  return "";
};