const { GoogleGenAI } = require("@google/genai");

const fs = require('fs');

require('dotenv').config()
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function listModels() {
  const models = await ai.models.list();
  let { page } = models;
  while (page.length > 0) {
    for (const m of page) {
      console.log(m.name, m.displayName, m.supportedActions);
    }
    page = models.hasNextPage() ? await models.nextPage() : [];
  }
}
async function analyzeDocument(filePath, mimeType) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString("base64");

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [
                {
                    parts: [
                        {text: `
                            Aja como um Auditor de Documentos Fiscais Brasileiro. 
                            Sua tarefa é analisar a imagem/PDF e extrair dados estruturados para um sistema de gestão financeira.

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
                            }`
                        },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        },
                    ]
                }
            ]

        });

        fs.unlink(filePath, () => console.log(mimeType, "deletado"));

        let responseIA = response.text.replace("/```/g", "").trim();
        console.log(responseIA)
        return JSON.parse(responseIA);
    
    } catch (error) {
        console.log("Erro ao mandar prompt:", error);    
    }

}

module.exports = analyzeDocument;