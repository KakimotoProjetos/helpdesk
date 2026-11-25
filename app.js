/*
 * app.js
 * Cadastro e edição de chamados.
 */

const formChamado = document.getElementById("form-chamado");
const mensagemStatus = document.getElementById("mensagem-status");

const campoNome = document.getElementById("nome");
const campoSetor = document.getElementById("setor");
const campoCategoria = document.getElementById("categoria");
const campoPrioridade = document.getElementById("prioridade");
const campoDescricao = document.getElementById("descricao");

// Verifica se existe um chamado para editar.
const parametros = new URLSearchParams(window.location.search);

const idEdicao = parametros.get("editar");

let modoEdicao = false;

// Carrega os dados do chamado no formulário.
if (idEdicao !== null) {

    const chamado = buscarChamadoPorId(idEdicao);

    if (chamado) {

        modoEdicao = true;

        campoNome.value = chamado.nome;
        campoSetor.value = chamado.setor;
        campoCategoria.value = chamado.categoria;
        campoPrioridade.value = chamado.prioridade;
        campoDescricao.value = chamado.descricao;

        // Impede alterar os dados que não fazem parte da edição.
        campoNome.disabled = true;
        campoSetor.disabled = true;
        campoCategoria.disabled = true;

        document.querySelector("h1").textContent = "Editar chamado";

        formChamado.querySelector("button[type='submit']")
            .textContent = "Salvar alterações";

    } else {

        exibirMensagem("Chamado não encontrado.", "erro");

    }
}

// Envia o formulário.
formChamado.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const dadosChamado = {
        nome: campoNome.value.trim(),
        setor: campoSetor.value.trim(),
        categoria: campoCategoria.value,
        prioridade: campoPrioridade.value,
        descricao: campoDescricao.value.trim()
    };

    if (!validarDadosChamado(dadosChamado)) {
        exibirMensagem(
            "Preencha todos os campos antes de enviar.",
            "erro"
        );

        return;
    }

    // Se estiver editando, atualiza o chamado.
    if (modoEdicao) {

        const sucesso = atualizarChamado(idEdicao, {
            descricao: dadosChamado.descricao,
            prioridade: dadosChamado.prioridade
        });

        if (sucesso) {

            alert("Chamado atualizado com sucesso!");

            window.location.href = "chamados.html";

        } else {

            exibirMensagem("Erro ao atualizar chamado.", "erro");

        }

        return;
    }

    // Se não estiver editando, cadastra um novo chamado.
    const chamadoCriado = salvarChamado(dadosChamado);

    exibirMensagem(
        `Chamado #${chamadoCriado.id} registrado com sucesso!`,
        "sucesso"
    );

    formChamado.reset();

});

// Verifica se todos os campos foram preenchidos.
function validarDadosChamado(dados) {

    return (
        dados.nome !== "" &&
        dados.setor !== "" &&
        dados.categoria !== "" &&
        dados.prioridade !== "" &&
        dados.descricao !== ""
    );

}

// Exibe mensagem para o usuário.
function exibirMensagem(texto, tipo) {

    mensagemStatus.textContent = texto;

    mensagemStatus.className =
        `mensagem-status mensagem-status-${tipo}`;

}