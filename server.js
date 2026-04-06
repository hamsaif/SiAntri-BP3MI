const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const app = express();
let lastRequest = {};
let isProcessing = false;

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

// 
app.post("/antrian", async (req, res) => {


    try {
        const data = req.body;

        const now = Date.now();

        // buat key unik
        const key = `${data.nama}-${data.hp}-${data.skema}`;

        // cek apakah ada request sebelumnya
        if (lastRequest[key] && (now -lastRequest[key] < 3000)) {
            return res.status(429).json({ message: "Tunggu sebentar" });
        }
        lastRequest[key] = now;

        const sheets = await getSheets();
        const sheetName = getTodaySheetName();
        await ensureSheetExists(sheets, sheetName);

        // ambil data untuk hitung nomor
        const getData = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A2:N`,
        });

        const allData = getData.data.values || [];

        // filter berdasarkan skema
        const filtered = allData.filter(row => row[13] == data.skema);

        // hitung nomor
        const nomorUrut = filtered.length + 1;

        // ambil prefix
        const prefix = getPrefix(data.skema);

        // buat nomor
        const nomor = prefix + String(nomorUrut).padStart(3, "0");

        // cek data terakhir sheet
        const check = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!B2:N`,
        });
        const rows = check.data.values || [];

        if (isProcessing){
            return res.status(429).json({ message: "Tunggu sebentar..." });
        }

        isProcessing = true;

        // simpan ke spreadsheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:O`,
            valueInputOption: "RAW",
            requestBody: {
                values: [
                    [
                        nomor,
                        data.nama,
                        data.jk,
                        data.provinsi,
                        data.kabupaten,
                        data.alamat,
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
    } finally {
        isProcessing = false;
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
// fungsi prefix skema
function getPrefix(skema) {
    if (skema === "SSW Mandiri") return "SSW";
    if (skema === "Mandiri") return "M";
    if (skema === "Cuti") return "C";
    return "";
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

        // buat sheet baru tiap hari
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



        // sheet id
        const newMeta = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });

        sheet = newMeta.data.sheets.find(
            s => s.properties.title === sheetName
        );

        const sheetId = sheet.properties.sheetId;

        console.log("Sheet ID:", sheetId);

        // buat header
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:O1`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    "No", "Nama", "Jenis Kelamin", "Provinsi","Kabupaten","Alamat", "Paspor", "Negara",
                    "Sektor", "Perusahaan", "Pendidikan", "Tgl OPP", "No HP", "Skema", "Status"
                ]]
            }
        });

        // dropdown status
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
                                    startColumnIndex: 14,
                                    endColumnIndex: 15
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
                                    startColumnIndex: 14,
                                    endColumnIndex: 15
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
                                    startColumnIndex: 14,
                                    endColumnIndex: 15
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
