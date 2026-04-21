
const Tesseract = require('tesseract.js');
require('dotenv').config();

async function auditDocument(imagePath){
    try {
        const mistralModule = await import('@mistralai/mistralai');
        const Mistral = mistralModule.Mistral;

        
const mistral = new Mistral({apiKey: process.env.MISTRAL_API_KEY});

        // Pegar o texto da imagem com uma OCR
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'por', // Especificar o idioma português melhora a precisão
        );

        // Jogar o texto para a IA interpretar
        const result = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [
            {
            content: `
                            Aja como um Auditor de Documentos Fiscais Brasileiro. 
                            Sua tarefa é analisar esse texto e extrair dados estruturados para um sistema de gestão financeira.

                            O texto a seguir foi retirado de uma foto de um documento:
                            ${text}

                            REGRAS DE EXTRAÇÃO:
                            1. Identifique o 'documentType': 'NF-e' (Nota Fiscal Eletrônica), 'NFC-e' (Cupom Fiscal), 'Recibo' ou 'Comprovante_Pix'.
                            2. Extraia o CNPJ ou CPF do Emissor (loja/prestador).
                            3. Extraia a Data de Emissão e converta para o formato YYYY-MM-DD.
                            4. Extraia o Valor Total como um número (ex: 1250.80).
                            5. CHAVE DE ACESSO: Se for uma nota fiscal, extraia os 44 dígitos da chave de acesso (geralmente perto do código de barras).

                            REGRAS DE AUDITORIA (Pé no chão):
                            - Hoje é dia 18/04/2026.
                            - 'isValid': Marque como true se a data de emissão for inferior a 90 dias.
                            - 'auditStatus': 
                            - 'GREEN': Documento legível, com CNPJ e dentro do prazo.
                            - 'YELLOW': Documento sem CNPJ ou com data superior a 90 dias.
                            - 'RED': Documento ilegível ou não é um comprovante de pagamento.

                            RESPONDA EXCLUSIVAMENTE EM JSON PURO:
                            {
                            "tipo": "string",
                            "emissor_cnpj": "string",
                            "data_emissao": "string",
                            "valor_total": number,
                            "chave_acesso": "string|null",
                            "auditoria": {
                            "is_valid": boolean,
                            "status": "string",
                            "alerta": "string (explicar o motivo se for YELLOW ou RED)"
                            }
                            }`,
            role: "user",
            },
            ],
        });

        // Retornar o resultado da IA como um JSON limpo
        let mistralContent = result.choices[0].message.content
            
        mistralContent = mistralContent.replace(/```json/, "").replace(/```/, "").trim();

        return JSON.parse(mistralContent);
    } catch (error) {

        console.log("Error: validation failed", error);
        return {Error: "Validation failed"}

    }
}

module.exports = auditDocument;


// async function run() {
//   const result = await mistral.chat.complete({
//     model: "mistral-small-latest",
//     messages: [
//       {
//         content: "Who is the best French painter? Answer in one short sentence.",
//         role: "user",
//       },
//     ],
//   });

//   console.log(result.choices[0].message.content);
// }

// run();