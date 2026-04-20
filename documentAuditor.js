// documentAuditor.js (100% Cloudflare)
const { raw } = require('express');
const fs = require('fs');
require('dotenv').config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

async function licenseAgreement(){
    console.log("Iniciando concordar com a licença");

    const response = await fetch(
        "https://api.cloudflare.com/client/v4/accounts/0c75d8a124d24c93457da4f8371f72f2/ai/run/@cf/meta/llama-3.2-11b-vision-instruct",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer TOKEN_REMOVIDO"
            },
            body: JSON.stringify({
                prompt: "agree"
            })
        }
        
    );
}

async function auditDocument(imagePath) {
    console.log('🚀 Iniciando auditoria 100% Cloudflare...');

    // Aceitar a licença do Cloudflare
    await licenseAgreement()
    .then( res => console.log("Agreement Success"))
    .catch(err => console.log("Error on license agree"));
    

    // 1. Ler a imagem e converter para Base64
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    const today = new Date().toISOString().split('T')[0];

    // 2. Construir o prompt para o modelo multimodal
    const prompt = `Aja como um Auditor de Documentos Fiscais Brasileiro. 
    Analise a imagem em anexo e extraia os dados estruturados conforme as regras.
    Não diga nada além do Json, envie apenas o JSON pronto para que eu faça um JSON.parse().

    REGRAS DE EXTRAÇÃO:
    1. Identifique o 'tipo': 'NF-e', 'NFC-e', 'Recibo' ou 'Comprovante_Pix'.
    2. Extraia o CNPJ ou CPF do Emissor.
    3. Extraia a Data de Emissão e converta para o formato YYYY-MM-DD.
    4. Extraia o Valor Total como um número (ex: 1250.80).
    5. CHAVE DE ACESSO: Se for uma nota fiscal, extraia os 44 dígitos.

    REGRAS DE AUDITORIA:
    - Hoje é dia ${today}.
    - 'is_valid': Marque como true se a data de emissão for inferior a 90 dias.
    - 'status': 'GREEN' (OK), 'YELLOW' (pendente) ou 'RED' (falha).
    - 'alerta': Explique o motivo se não for GREEN.

    RESPONDA EXCLUSIVAMENTE EM JSON PURO, SEM TEXTO ADICIONAL:
    {
    "tipo": "string",
    "emissor_cnpj": "string",
    "data_emissao": "string",
    "valor_total": number,
    "chave_acesso": "string|null",
    "auditoria": {
        "is_valid": boolean,
        "status": "string",
        "alerta": "string"
    }
    }`;

    // 3. Fazer a chamada única para o Cloudflare
    const response = await fetch(
    'https://api.cloudflare.com/client/v4/accounts/0c75d8a124d24c93457da4f8371f72f2/ai/run/@cf/meta/llama-3.2-11b-vision-instruct',
    {
        method: 'POST',
        headers: {
        'Authorization': 'Bearer TOKEN_REMOVIDO',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        messages: [
            {
            role: 'user',
            content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
            ]
            }
        ]
        })
    }
    );

    fs.unlink(imagePath, ()=> console.log("Image deleted"));

    const data = await response.json();
    const rawJson = data.result.response;

    if (!rawJson) {
    console.log(data)
    return "Erro ao enviar prompt: " + data;
    }

    console.log(rawJson)
    
    // 4. Limpar e retornar o JSON
    const jsonMatch = rawJson.toString().match(/\{[\s\S]*\}/);
    console.log(jsonMatch[0])
    return JSON.parse(jsonMatch[0]);
}

module.exports = auditDocument;