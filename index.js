const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const axios = require('axios');

// Função para obter o objeto da planilha
async function GetDoc() {
    const doc = new GoogleSpreadsheet('1Vm52L6SqvX4Rd6oPn2QTRT57aFGqSbFCX4NpqQWdURA');

    const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n'); // Ajuste para formato de chave privada

    const client = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    await doc.useServiceAccountAuth({
        client_email: process.env.CLIENT_EMAIL,
        private_key: privateKey,
    });

    await doc.loadInfo(); // Carregar informações da planilha
    return doc;
}

// Função para ler uma planilha específica e obter os dados
async function ReadWorkSheet() {
    const doc = await GetDoc();
    const sheet = doc.sheetsByIndex[0]; // Ler a primeira planilha

    const rows = await sheet.getRows();
    const userList = rows.map(row => ({
        nome: row.nome,
        idade: parseInt(row.idade),
        email: row.email
    }));

    return userList;
}

// Função para adicionar um usuário via API
async function AddUser(data = {}) {
    try {
        const response = await axios.post('URL_DA_SUA_API_DE_USUARIOS', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error.message);
        throw error;
    }
}

// Função principal que lê a planilha e adiciona os usuários à API
async function processSpreadsheet() {
    try {
        const userList = await ReadWorkSheet();

        for (const user of userList) {
            await AddUser(user);
        }

        return 'Processo concluído com sucesso!';
    } catch (error) {
        console.error('Erro durante o processamento:', error);
        throw error;
    }
}

// Chamada da função principal
processSpreadsheet()
    .then(message => console.log(message))
    .catch(err => console.error('Erro geral:', err));
