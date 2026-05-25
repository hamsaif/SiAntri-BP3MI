// link spredsheet : 
// https://docs.google.com/spreadsheets/d/1u8QD8TtkEezK5TMr-gdLrtC_Zmpl-CTj3Xh4nqPjyao/edit?usp=sharing

require("dotenv").config(); // load .env
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});