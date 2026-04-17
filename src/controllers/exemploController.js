import ExemploModel from '../models/ExemploModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, estado, preco } = req.body;

        if (!nome){
            return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        }


        const exemplo = new ExemploModel({ nome, estado: estado !== undefined ? Boolean(estado) : true,
            preco: preco ? parseFloat(preco) : null});
        const data = await exemplo.criar();

        return res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        return res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ExemploModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(400).json({ message: 'Nenhum registro encontrado.' });
        }

        return res.status(200).json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const exemplo = await ExemploModel.buscarPorId(parseInt(id));

        if (!exemplo) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        return res.status(200).json({ data: exemplo });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
         const idNumerico = parseInt(id);

        

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const registroExistente = await ExemploModel.buscarPorId(idNumerico);
        if (!registroExistente) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        // 4. Prepara os dados para o banco (Garantindo tipos corretos)
        const dadosParaAtualizar = {};
        
        if (req.body.nome !== undefined) dadosParaAtualizar.nome = req.body.nome;
        if (req.body.estado !== undefined) dadosParaAtualizar.estado = req.body.estado;
        if (req.body.preco !== undefined) dadosParaAtualizar.preco = parseFloat(req.body.preco);
        

    
        const data = await ExemploModel.atualizar(idNumerico, dadosParaAtualizar);

        return res.status(200).json({ 
            message: `O registro "${data.nome}" foi atualizado com sucesso!`, 
            data 
        });

    } catch (error) {
        console.error('Erro ao atualizar no servidor:', error);
        return res.status(500).json({ error: 'Erro ao atualizar registro interno.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const exemplo = await ExemploModel.buscarPorId(parseInt(id));

        if (!exemplo) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await exemplo.deletar();

        return res.status(200).json({ message: `O registro "${exemplo.nome}" foi deletado com sucesso!`, deletado: exemplo });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
