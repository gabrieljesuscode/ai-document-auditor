import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import 'dotenv/config';
import { json } from 'stream/consumers';

const mistral = new Mistral({apiKey: process.env.MISTRAL_API_KEY});


let today = new Date();
const prompt = `Aja como um Auditor de Documentos Fiscais Brasileiro.  
                Sua tarefa é analisar essa imagem e extrair dados estruturados para um sistema de gestão financeira.

                REGRAS DE EXTRAÇÃO:
                1. Identifique o 'documentType': 'NF-e' (Nota Fiscal Eletrônica), 'NFC-e' (Cupom Fiscal), 'Recibo' ou 'Comprovante_Pix'.
                2. Extraia o CNPJ ou CPF do Emissor (loja/prestador).
                3. Extraia a Data de Emissão e converta para o formato YYYY-MM-DD.
                4. Extraia o Valor Total como um número (ex: 1250.80).
                5. CHAVE DE ACESSO: Se for uma nota fiscal, extraia os 44 dígitos da chave de acesso (geralmente perto do código de barras).

                REGRAS DE AUDITORIA (Pé no chão):
                - Hoje é dia ${today}.
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


let promptExample
// JSON Schema exigido pela API (completo)
const outputSchema = {
  type: "object",
  properties: {
    tipo: {
      type: "string",
      enum: ["NF-e", "NFC-e", "Recibo", "Comprovante_Pix"],
      description: "Tipo do documento fiscal"
    },
    emissor_cnpj: {
      type: "string",
      description: "CNPJ ou CPF do emissor"
    },
    data_emissao: {
      type: "string",
      format: "date",
      description: "Data no formato YYYY-MM-DD"
    },
    valor_total: {
      type: "number",
      description: "Valor total do documento"
    },
    chave_acesso: {
      type: ["string", "null"],
      description: "Chave de acesso de 44 dígitos (se aplicável)"
    },
    auditoria: {
      type: "object",
      properties: {
        is_valid: { type: "boolean" },
        status: {
          type: "string",
          enum: ["GREEN", "YELLOW", "RED"]
        },
        alerta: { type: "string" }
      },
      required: ["is_valid", "status", "alerta"]
    }
  },
  required: ["tipo", "emissor_cnpj", "data_emissao", "valor_total", "auditoria"]
};

async function auditDocument(imageBuffer){
    try {
        console.log("Começando análise");

        // Tratar a URL da imagem para a Mistral OCR
        const base64Image = imageBuffer.toString('base64');
        const mimeType = 'image/png';
        const imageUri = `data:${mimeType};base64,${base64Image}`
        console.log("Imagem tratada para base64");

        // Enviar imagem para a IA interpretar
        const result = await mistral.chat.complete({
            model: "pixtral-12b-2409", // O modelo 'Pixtral' ou 'Mistral-Large' são os que "veem" e "entendem"
            messages: [
            {
                role: "user",
                content: [
                { type: "text", text: prompt }, // O seu prompt gigante de auditor
                { type: "image_url", imageUrl: imageUri } // O documento em si
                ]
            }
            ],
            response_format: {
            type: "json_schema",
            json_schema: {
                name: "auditoria_fiscal",
                strict: true,
                schema: outputSchema // O seu schema que você já definiu!
            }
            }
        });
        console.log(result)

        const mistralResponse = result.choices[0].message.content;
        
        console.log("Imagem enviada para IA");

        // Retornar o resultado da IA como um JSON limpo
        const jsonClean = mistralResponse.toString().replace(/```json/,"").replace(/```/, "").trim();
        console.log("Json enviado com sucesso")
        return JSON.parse(jsonClean);

    } catch (error) {

        console.log("Error: validation failed", error);
        return {Error: "Validation failed"}

    }
}

export default auditDocument;




