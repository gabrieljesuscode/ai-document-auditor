import express from 'express';
import multer from 'multer';
import auditDocument from './documentAuditor.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();
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

    const response = await auditDocument(req.file.buffer);
    // const docInfo = JSON.parse(response)

    // console.log(docInfo)
    res.json(response);
});


app.listen(PORT, (error) => {
    console.log(`Servidor Iniciado em http://localhost:${PORT}`)
})