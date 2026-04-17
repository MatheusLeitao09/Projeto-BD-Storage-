import ExemploModel from '../models/ExemploModel.js';

import {
    upload as uploadStorage,
    deletar as deletarStorage,
} from '../lib/helpers/arquivoHelper.js';

const uploadArquivo = (tipo) => async (req, res) => {
    try {
        const { id } = req.params;
        const idNumerico = parseInt(id);

        if (isNaN(idNumerico)) return res.status(400).json({ error: 'ID inválido.' });

        const exemplo = await ExemploModel.buscarPorId(idNumerico);
        if (!exemplo) return res.status(404).json({ error: 'Registro não encontrado.' });
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

        // Se já tinha arquivo, deleta do Supabase
        if (exemplo[tipo]) await deletarStorage(exemplo[tipo]);

        // 1. Faz o upload e pega a URL real que o helper devolve
        const urlGerada = await uploadStorage(id, req.file);

        // 2. SALVA NO BANCO (Usando o Model diretamente)
        // Certifique-se que seu ExemploModel tem a função atualizar(id, dados)
        await ExemploModel.atualizar(idNumerico, { [tipo]: urlGerada });

        // 3. RETORNA A URL GERADA (Não pode ser null!)
        return res.status(200).json({
            message: `${tipo} enviado com sucesso!`,
            url: urlGerada,
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        return res.status(500).json({ error: `Erro ao fazer upload do ${tipo}.` });
    }
};

const buscarArquivo = (tipo) => async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const exemplo = await ExemploModel.buscarPorId(parseInt(id));

        if (!exemplo) return res.status(404).json({ error: 'Registro não encontrado.' });

        if (!exemplo[tipo]) return res.status(404).json({ error: `Nenhum ${tipo} cadastrado.` });

        return res.status(200).json({ url: exemplo[tipo] });
    } catch (error) {

        return res.status(500).json({ error: `Erro ao buscar ${tipo}.` });

    }
};

const deletarArquivo = (tipo) => async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const exemplo = await ExemploModel.buscarPorId(parseInt(id));

        if (!exemplo) return res.status(404).json({ error: 'Registro não encontrado.' });

        if (!exemplo[tipo]) return res.status(404).json({ error: `Nenhum ${tipo} para remover.` });

        await deletarStorage(exemplo[tipo]);

        exemplo[tipo] = null;

        await exemplo.atualizar();

        return res.status(200).json({ message: `${tipo} removido com sucesso!` });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao remover ${tipo}.` });
    }
};

export const uploadFoto = uploadArquivo('foto');

export const buscarFoto = buscarArquivo('foto');

export const deletarFoto = deletarArquivo('foto');

export const uploadDocumento = uploadArquivo('documento');

export const buscarDocumento = buscarArquivo('documento');

export const deletarDocumento = deletarArquivo('documento');
