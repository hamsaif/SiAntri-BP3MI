const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const app = express();
let counter = 0;
let dataAntrian = [];

// link spredsheet : 
// https://docs.google.com/spreadsheets/d/1u8QD8TtkEezK5TMr-gdLrtC_Zmpl-CTj3Xh4nqPjyao/edit?usp=sharing
// id dr link spreadsheet
const SPREADSHEET_ID = "1u8QD8TtkEezK5TMr-gdLrtC_Zmpl-CTj3Xh4nqPjyao";

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function getSheets() {
    const client = await auth.getClient();
    return google.sheets({ version: "v4", auth: client });
}



// middleware
app.use(cors());
app.use(express.json());

// testing api
app.post("/antrian", async (req, res) => {

    try {
        const data = req.body;

        const sheets = await getSheets();
        const sheetName = getTodaySheetName();
        await ensureSheetExists(sheets, sheetName);

        // ambil data untuk hitung nomor
        const getData = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A2:A`,
        });

        const jumlah = getData.data.values ? getData.data.values.length : 0;
        const nomor = String(jumlah + 1).padStart(3, "0");

        // simpan ke spreadsheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:N`,
            valueInputOption: "RAW",
            requestBody: {
                values: [
                    [
                        nomor,
                        data.nama,
                        data.jk,
                        data.provinsi,
                        data.daerah,
                        data.paspor,
                        data.negara,
                        data.sektor,
                        data.perusahaan,
                        data.pendidikan,
                        data.tgl,
                        data.hp,
                        data.skema,
                        "Belum Dilayani"
                    ]
                ],
            },
        });

        res.json({ nomor });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// fungsi nama sheet
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

// cek sheet apakah hari ini sudah ad atau belum
async function ensureSheetExists(sheets, sheetName) {
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });

    let sheet = meta.data.sheets.find(
        s => s.properties.title === sheetName
    );

    if (!sheet) {

        // 1. buat sheet baru tiap hari
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetName
                            }
                        }
                    }
                ]
            }
        });

        // 2. sheet id
        const newMeta = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });

        sheet = newMeta.data.sheets.find(
            s => s.properties.title === sheetName
        );

        const sheetId = sheet.properties.sheetId;

        console.log("Sheet ID:", sheetId);

        // 3. header
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:N1`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    "No", "Nama", "Jenis Kelamin", "Provinsi", "Daerah", "Paspor", "Negara",
                    "Sektor", "Perusahaan", "Pendidikan", "Tgl OPP", "No HP", "Skema", "Status"
                ]]
            }
        });

        // 4. dropdown status
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        setDataValidation: {
                            range: {
                                sheetId: sheetId,
                                startRowIndex: 1,
                                endRowIndex: 1000,
                                startColumnIndex: 13,
                                endColumnIndex: 14
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
                                strict: false,
                                showCustomUi: true
                            }
                        }
                    },
                    // Belum Dilayani
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{
                                    sheetId: sheetId,
                                    startRowIndex: 1,
                                    endRowIndex: 1000,
                                    startColumnIndex: 13,
                                    endColumnIndex: 14
                                }],
                                booleanRule: {
                                    condition: {
                                        type: "TEXT_EQ",
                                        values: [{ userEnteredValue: "Belum Dilayani" }]
                                    },
                                    format: {
                                        backgroundColor: {
                                            red: 1,
                                            green: 1,
                                            blue: 0.6
                                        }
                                    }
                                }
                            },
                            index: 0
                        }
                    },

                    // Sedang Dilayani
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{
                                    sheetId: sheetId,
                                    startRowIndex: 1,
                                    endRowIndex: 1000,
                                    startColumnIndex: 13,
                                    endColumnIndex: 14
                                }],
                                booleanRule: {
                                    condition: {
                                        type: "TEXT_EQ",
                                        values: [{ userEnteredValue: "Sedang Dilayani" }]
                                    },
                                    format: {
                                        backgroundColor: {
                                            red: 0.6,
                                            green: 0.8,
                                            blue: 1
                                        }
                                    }
                                }
                            },
                            index: 0
                        }
                    },

                    // Sudah Dilayani
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{
                                    sheetId: sheetId,
                                    startRowIndex: 1,
                                    endRowIndex: 1000,
                                    startColumnIndex: 13,
                                    endColumnIndex: 14
                                }],
                                booleanRule: {
                                    condition: {
                                        type: "TEXT_EQ",
                                        values: [{ userEnteredValue: "Sudah Dilayani" }]
                                    },
                                    format: {
                                        backgroundColor: {
                                            red: 0.6,
                                            green: 1,
                                            blue: 0.6
                                        }
                                    }
                                }
                            },
                            index: 0
                        }
                    }
                ]
            }
        });


    }
}
