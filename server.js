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

// Middlewares
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/pages/home.html")
});

app.post("/audit", upload.single('doc'), async (req, res) => {
    if (!req.file) return res.send("Erro: Arquivo não encontrado");

    // console.log(req.file.buffer)
    // const response = await auditDocument(req.file.buffer);

    res.json(req.file.beffer);
});


app.listen(PORT, (error) => {
    console.log(`Servidor Iniciado em http://localhost:${PORT}`)
})