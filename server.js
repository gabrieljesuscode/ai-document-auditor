const express = require('express');
const auditDocument = require('./documentAuditor')
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({storage: storage});
const app = express();

const PORT = 3000;


app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/pages/home.html")
});

app.post("/docsave", upload.single('doc'), async (req, res) => {
    if (!req.file) return res.send("Erro: Arquivo não encontrado");

    const response = await auditDocument(req.file.path);
    // const docInfo = JSON.parse(response)

    // console.log(docInfo)
    res.json(response);
});


app.listen(PORT, (error) => {
    console.log(`Servidor Iniciado em http://localhost:${PORT}`)
})