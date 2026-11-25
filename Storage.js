/*
 * Storage.js
 * Camada de persistência local do HelpDesk Escolar.
 * Responsável por salvar, listar, atualizar, filtrar e excluir chamados.
 */

const CHAVE_STORAGE = "chamadas";

function listarChamados() {
    try {
        const dados = localStorage.getItem(CHAVE_STORAGE);
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error("Erro ao carregar os chamados:", erro);
        return [];
    }
}

function salvarListaCompleta(chamados) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(chamados));
}

function gerarNovoID() {
    const chamados = listarChamados();

    if (chamados.length === 0) {
        return 1;
    }

    const maiorId = Math.max(...chamados.map((chamado) => Number(chamado.id) || 0));
    return maiorId + 1;
}

function salvarChamado(dadosChamado) {
    const chamados = listarChamados();

    const novoChamado = {
        id: gerarNovoID(),
        nome: dadosChamado.nome,
        setor: dadosChamado.setor,
        categoria: dadosChamado.categoria,
        descricao: dadosChamado.descricao,
        prioridade: dadosChamado.prioridade,
        status: "Aberto",
        dataCriacao: new Date().toISOString()
    };

    chamados.push(novoChamado);
    salvarListaCompleta(chamados);

    return novoChamado;
}

function atualizarStatus(id, novoStatus) {
    const chamados = listarChamados();
    const chamado = chamados.find((item) => Number(item.id) === Number(id));

    if (!chamado) {
        console.warn(`Chamado com ID ${id} não encontrado.`);
        return false;
    }

    chamado.status = novoStatus;
    salvarListaCompleta(chamados);
    return true;
}

// Mantém compatibilidade com o nome utilizado em versões anteriores.
function atualizaStatus(id, novoStatus) {
    return atualizarStatus(id, novoStatus);
}

function filtrarPorStatus(status) {
    const chamados = listarChamados();

    if (!status || status === "Todos") {
        return chamados;
    }

    return chamados.filter((chamado) => chamado.status === status);
}

function buscarChamadosPorTexto(texto) {
    const chamados = listarChamados();

    const pesquisa = texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    if (pesquisa === "") {
        return chamados;
    }

    return chamados.filter((chamado) => {
        const nome = chamado.nome.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const descricao = chamado.descricao.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return nome.includes(pesquisa) ||
               descricao.includes(pesquisa);
    });
}

function atualizarChamado(id, novosDados) {
    const chamados = listarChamados();

    const chamado = chamados.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!chamado) {
        return false;
    }

    chamado.descricao = novosDados.descricao;
    chamado.prioridade = novosDados.prioridade;

    salvarListaCompleta(chamados);

    return true;
}

function buscarChamadoPorId(id) {
    const chamados = listarChamados();

    return chamados.find(
        (item) => Number(item.id) === Number(id)
    );
}

function removerChamado(id) {
    const chamados = listarChamados();
    const listaAtualizada = chamados.filter(
        (chamado) => Number(chamado.id) !== Number(id)
    );

    if (listaAtualizada.length === chamados.length) {
        console.warn(`Chamado com ID ${id} não encontrado.`);
        return false;
    }

    salvarListaCompleta(listaAtualizada);
    return true;
}

// Mantém compatibilidade com o nome utilizado anteriormente.
function removerChamados(id) {
    return removerChamado(id);
}

function limparTodosChamados() {
    localStorage.removeItem(CHAVE_STORAGE);
}
