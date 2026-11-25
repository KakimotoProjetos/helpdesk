/*
 * chamados.js
 * Camada de interface da tela de listagem (chamados.html).
 * Exibe os chamados, filtra por status, ordena, atualiza e exclui.
 */

const containerLista = document.getElementById("lista-chamados");
const mensagemVazia = document.getElementById("mensagem-vazia");
const filtroStatus = document.getElementById("filtro-status");
const ordenarChamados = document.getElementById("ordenar-chamados");
const pesquisaChamado = document.getElementById("pesquisa-chamado");

if (pesquisaChamado) {
    pesquisaChamado.addEventListener("input", renderizarLista);
}

const STATUS_DISPONIVEIS = ["Aberto", "Em andamento", "Resolvido"];

document.addEventListener("DOMContentLoaded", renderizarLista);

if (filtroStatus) {
    filtroStatus.addEventListener("change", renderizarLista);
}

if (ordenarChamados) {
    ordenarChamados.addEventListener("change", renderizarLista);
}

/**
 * Atualiza os números dos contadores conforme os chamados salvos.
 */
function atualizarContadores() {
    const chamados = listarChamados();

    const abertos = chamados.filter((chamado) => chamado.status === "Aberto").length;
    const andamento = chamados.filter((chamado) => chamado.status === "Em andamento").length;
    const resolvidos = chamados.filter((chamado) => chamado.status === "Resolvido").length;

    document.getElementById("contador-abertos").textContent = abertos;
    document.getElementById("contador-andamento").textContent = andamento;
    document.getElementById("contador-resolvidos").textContent = resolvidos;
}

/**
 * Busca, filtra, ordena e desenha os cartões na tela.
 */
function renderizarLista() {
    if (!containerLista) {
        return;
    }

    const statusSelecionado = filtroStatus.value;
    const tipoOrdenacao = ordenarChamados.value;
    const textoPesquisa = pesquisaChamado.value;

    let chamados = buscarChamadosPorTexto(textoPesquisa);

    if (statusSelecionado !== "Todos") {
        chamados = chamados.filter(
            (chamado) => chamado.status === statusSelecionado
        );
    }

    chamados = ordenarLista(chamados, tipoOrdenacao);

    containerLista.replaceChildren();

    atualizarContadores();

    if (chamados.length === 0) {
        mensagemVazia.hidden = false;
        mensagemVazia.textContent = "Nenhum chamado encontrado.";
        return;
    }

    mensagemVazia.hidden = true;

    chamados.forEach((chamado) => {
        containerLista.appendChild(criarCartaoChamado(chamado));
    });
}

/**
 * Retorna uma nova lista ordenada, sem alterar a lista original.
 */
function ordenarLista(chamados, tipoOrdenacao) {
    const lista = [...chamados];

    if (tipoOrdenacao === "antigos") {
        return lista.sort(
            (a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao)
        );
    }

    if (tipoOrdenacao === "prioridade") {
        const pesoPrioridade = { Alta: 3, Media: 2, Média: 2, Baixa: 1 };

        return lista.sort((a, b) => {
            const diferenca = (pesoPrioridade[b.prioridade] || 0) -
                (pesoPrioridade[a.prioridade] || 0);

            if (diferenca !== 0) {
                return diferenca;
            }

            return new Date(b.dataCriacao) - new Date(a.dataCriacao);
        });
    }

    return lista.sort(
        (a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)
    );
}

/**
 * Cria o elemento HTML que representa um chamado.
 */
function criarCartaoChamado(chamado) {
    const cartao = document.createElement("article");
    cartao.className = "cartao-chamado chamado-card";

    const dataFormatada = formatarData(chamado.dataCriacao);
    const prioridadeClasse = normalizarClasse(chamado.prioridade);
    const idSeguro = Number(chamado.id);

    const topo = document.createElement("div");
    topo.className = "cartao-chamado-topo";

    const numero = document.createElement("span");
    numero.className = "numero-chamado";
    numero.textContent = `#${chamado.id}`;

    const prioridade = document.createElement("span");
    prioridade.className = `badge-prioridade prioridade${prioridadeClasse}`;
    prioridade.textContent = chamado.prioridade;

    topo.append(numero, prioridade);

    const titulo = document.createElement("h2");
    titulo.className = "titulo-chamado";
    titulo.textContent = chamado.categoria;

    const descricao = document.createElement("p");
    descricao.className = "descricao-chamado";
    descricao.textContent = chamado.descricao;

    const detalhes = document.createElement("div");
    detalhes.className = "detalhes-chamado chamado-info";

    const solicitante = document.createElement("span");
    solicitante.textContent = `Solicitante: ${chamado.nome}`;

    const setor = document.createElement("span");
    setor.textContent = `Setor: ${chamado.setor}`;

    const data = document.createElement("span");
    data.textContent = `Aberto em: ${dataFormatada}`;

    detalhes.append(solicitante, setor, data);

    const rodape = document.createElement("div");
    rodape.className = "rodape-chamado";

    const grupoStatus = document.createElement("div");
    const rotuloStatus = document.createElement("label");
    rotuloStatus.className = "rotulo-status";
    rotuloStatus.htmlFor = `status-${idSeguro}`;
    rotuloStatus.textContent = "Status";

    const seletorStatus = document.createElement("select");
    seletorStatus.className = "select-status";
    seletorStatus.id = `status-${idSeguro}`;
    seletorStatus.dataset.id = idSeguro;

    STATUS_DISPONIVEIS.forEach((status) => {
        const opcao = document.createElement("option");
        opcao.value = status;
        opcao.textContent = status;
        opcao.selected = status === chamado.status;
        seletorStatus.appendChild(opcao);
    });

    seletorStatus.addEventListener("change", aoMudarStatus);
    grupoStatus.append(rotuloStatus, seletorStatus);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-excluir";
    botaoExcluir.textContent = "Excluir chamado";
    botaoExcluir.dataset.id = idSeguro;
    botaoExcluir.addEventListener("click", aoExcluirChamado);

    const botaoEditar = document.createElement("button");

    botaoEditar.type = "button";
    botaoEditar.className = "botao-editar";
    botaoEditar.textContent = "Editar chamado";
    botaoEditar.dataset.id = idSeguro;

    botaoEditar.addEventListener("click", function () {
        window.location.href = `index.html?editar=${idSeguro}`;
    });

    rodape.append(
        grupoStatus,
        botaoEditar,
        botaoExcluir
    );

    cartao.append(topo, titulo, descricao, detalhes, rodape);

    return cartao;
}

/**
 * Atualiza o status do chamado selecionado.
 */
function aoMudarStatus(evento) {
    const id = Number(evento.target.dataset.id);
    const novoStatus = evento.target.value;

    const sucesso = atualizarStatus(id, novoStatus);

    if (!sucesso) {
        alert("Não foi possível atualizar o status desse chamado.");
        return;
    }

    renderizarLista();
}

/**
 * Solicita confirmação antes de excluir o chamado.
 */
function aoExcluirChamado(evento) {
    const id = Number(evento.currentTarget.dataset.id);

    const confirmar = confirm(
        `Tem certeza de que deseja excluir o chamado #${id}? Essa ação não poderá ser desfeita.`
    );

    if (!confirmar) {
        return;
    }

    const sucesso = removerChamado(id);

    if (!sucesso) {
        alert("Não foi possível excluir esse chamado.");
        return;
    }

    renderizarLista();
}

/**
 * Formata uma data ISO para o padrão dd/MM/aaaa HH:mm.
 */
function formatarData(dataIso) {
    const data = new Date(dataIso);

    if (Number.isNaN(data.getTime())) {
        return "Data não disponível";
    }

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

/**
 * Deixa o texto adequado para uso em uma classe CSS.
 */
function normalizarClasse(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}
