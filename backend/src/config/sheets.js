const { google } = require("googleapis");

// ID spreadsheet dari .env (lebih aman)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// AUTH GOOGLE
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ambil instance sheets
async function getSheets() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// NAMA SHEET HARI INI
function getTodaySheetName() {
  const today = new Date();

  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dd = String(today.getDate()).padStart(2, "0");
  const mm = bulan[today.getMonth()];
  const yyyy = today.getFullYear();

  return `Pelayanan_${dd}_${mm}_${yyyy}`;
}

// CEK / BUAT SHEET
async function ensureSheetExists(sheets, sheetName) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });

  let sheet = meta.data.sheets.find(
    s => s.properties.title === sheetName
  );

  if (!sheet) {
    // buat sheet baru
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetName }
            }
          }
        ]
      }
    });

    // ambil ulang sheet
    const newMeta = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    sheet = newMeta.data.sheets.find(
      s => s.properties.title === sheetName
    );

    const sheetId = sheet.properties.sheetId;

  
    // HEADER
  
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:O1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "No", "Nama", "JK", "Provinsi", "Kabupaten", "Alamat",
          "Paspor", "Negara", "Sektor", "Perusahaan",
          "Pendidikan", "Tgl", "HP", "Skema", "Status", "Jam"
        ]]
      }
    });
  
    // STYLE HEADER
  
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.95,
                    green: 0.75,
                    blue: 0.2
                  },
                  textFormat: {
                    bold: true,
                    foregroundColor: {
                      red: 0,
                      green: 0,
                      blue: 0
                    }
                  },
                  horizontalAlignment: "CENTER"
                }
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
            }
          },

        
          // WARNA STATUS
        

          // BELUM DILAYANI = KUNING
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId,
                    startRowIndex: 1,
                    endRowIndex: 1000,
                    startColumnIndex: 14,
                    endColumnIndex: 15
                  }
                ],
                booleanRule: {
                  condition: {
                    type: "TEXT_EQ",
                    values: [{ userEnteredValue: "Belum Dilayani" }]
                  },
                  format: {
                    backgroundColor: {
                      red: 1,
                      green: 1,
                      blue: 0.4
                    }
                  }
                }
              },
              index: 0
            }
          },

          // SEDANG DILAYANI = HIJAU
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId,
                    startRowIndex: 1,
                    endRowIndex: 1000,
                    startColumnIndex: 14,
                    endColumnIndex: 15
                  }
                ],
                booleanRule: {
                  condition: {
                    type: "TEXT_EQ",
                    values: [{ userEnteredValue: "Sedang Dilayani" }]
                  },
                  format: {
                    backgroundColor: {
                      red: 0.6,
                      green: 0.9,
                      blue: 0.6
                    }
                  }
                }
              },
              index: 1
            }
          },

          // SUDAH DILAYANI = BIRU
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId,
                    startRowIndex: 1,
                    endRowIndex: 1000,
                    startColumnIndex: 14,
                    endColumnIndex: 15
                  }
                ],
                booleanRule: {
                  condition: {
                    type: "TEXT_EQ",
                    values: [{ userEnteredValue: "Sudah Dilayani" }]
                  },
                  format: {
                    backgroundColor: {
                      red: 0.55,
                      green: 0.75,
                      blue: 1
                    }
                  }
                }
              },
              index: 2
            }
          }
        ]
      }
    });


  
    // DROPDOWN STATUS
  
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 14,
                endColumnIndex: 15
              },
              rule: {
                condition: {
                  type: "ONE_OF_LIST",
                  values: [
                    { userEnteredValue: "Belum Dilayani" },
                    { userEnteredValue: "Sedang Dilayani" },
                    { userEnteredValue: "Sudah Dilayani" }
                  ]
                },
                showCustomUi: true
              }
            }
          }
        ]
      }
    });
  }
}

// INSERT DATA
async function insertRow(data) {
  const sheets = await getSheets();
  const sheetName = getTodaySheetName();

  await ensureSheetExists(sheets, sheetName);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:O`,
    valueInputOption: "RAW",
    requestBody: {
      values: [data]
    }
  });
}

// EXPORT
module.exports = {
  insertRow
};