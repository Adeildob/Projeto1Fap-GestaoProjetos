document.addEventListener("DOMContentLoaded", function () {
  const formFuncionario = document.getElementById("form-funcionario");
  const formProjeto = document.getElementById("form-projeto");
  const formAtribuicao = document.getElementById("form-atribuicao");
  const formEditarFuncionario = document.getElementById(
    "form-editar-funcionario"
  );
  const formEditarProjeto = document.getElementById("form-editar-projeto");
  const listaFuncionarios = document.getElementById("lista-funcionarios");
  const listaProjetos = document.getElementById("lista-projetos");
  const selectFuncionario = document.getElementById("funcionario");
  const selectProjeto = document.getElementById("projeto");

  const baseUrl = "http://localhost:3000";

  // Função para carregar Funcionários
  function carregarFuncionarios() {
    fetch(`${baseUrl}/funcionarios`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        listaFuncionarios.innerHTML = "";
        selectFuncionario.innerHTML = "";

        data.forEach((funcionario) => {
          listaFuncionarios.innerHTML += `<li data-id="${funcionario.id}">${funcionario.nome} - ${funcionario.cargo} </li>`;
          selectFuncionario.innerHTML += `<option value="${funcionario.id}">${funcionario.nome}</option>`;
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar funcionário: ", error);
      });
  }

  // Função para carregar Projetos
  function carregarProjetos() {
    fetch(`${baseUrl}/projetos`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro na resposta da rede");
        }
        return response.json();
      })
      .then((data) => {
        listaProjetos.innerHTML = "";
        selectProjeto.innerHTML = "";
        data.forEach((projeto) => {
          listaProjetos.innerHTML += `<li data-id="${projeto.id}">${projeto.id} - ${projeto.Nome} - ${projeto.descricao}</li>`;
          selectProjeto.innerHTML += `<option value="${projeto.id}">${projeto.Nome}</option>`;
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar os projetos:", error);
      });
  }

  // Carregar projetos e os funcionários atribuídos
  function carregarProjetosComFuncionarios() {
    fetch(`${baseUrl}/projetos-com-funcionarios`)
      .then((response) => response.json())
      .then((data) => {
        const listaProjetosComFuncionarios = document.getElementById(
          "listaProjetosComFuncionarios"
        );
        listaProjetosComFuncionarios.innerHTML = "";

        data.forEach((projeto) => {
          let funcionariosList = "";
          if (projeto.funcionarios.length > 0) {
            funcionariosList = `<ul>`;
            projeto.funcionarios.forEach((funcionario) => {
              funcionariosList += `<li>${funcionario.funcionario_nome}</li>`;
            });
            funcionariosList += `</ul>`;
          } else {
            funcionariosList = `<p>Nenhum funcionário atribuído.</p>`;
          }

          listaProjetosComFuncionarios.innerHTML += `
            <div>
              <h3>${projeto.projeto_nome}</h3>
              ${funcionariosList}
            </div>
          `;
        });
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }

  //Função para conversão de formato ISO da data
  function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Chame essa função após carregar a página ou ao atribuir um funcionário a um projeto
  document.addEventListener("DOMContentLoaded", () => {
    carregarProjetosComFuncionarios();
  });

  // Adicionar Funcionário
  formFuncionario.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const cargo = document.getElementById("cargo").value;
    const email = document.getElementById("email").value;
    const dataContratacao = document.getElementById("data_contratacao").value;

    fetch(`${baseUrl}/funcionarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        cargo,
        email,
        data_contratacao: dataContratacao,
      }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
      })
      .then(() => {
        carregarFuncionarios();
        formFuncionario.reset();
      });
  });

  // Adicionar Projeto
  formProjeto.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = document.getElementById("nome-projeto").value;
    const descricao = document.getElementById("descricao").value;
    const dataInicio = document.getElementById("data_inicio").value;
    const dataFim = document.getElementById("data_fim").value;

    fetch(`${baseUrl}/projetos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        descricao,
        data_inicio: dataInicio,
        data_fim: dataFim,
      }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
      })
      .then(() => {
        carregarProjetos();
        formProjeto.reset();
      });
  });

  // Atribuir Funcionário a Projeto
  formAtribuicao.addEventListener("submit", function (e) {
    e.preventDefault();
    const funcionarios_id = selectFuncionario.value;
    const projetos_id = selectProjeto.value;

    fetch(`${baseUrl}/atribuir-funcionario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ funcionarios_id, projetos_id }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
      })
      .then(() => {
        formAtribuicao.reset();
        carregarProjetosComFuncionarios();
      })
      .catch((error) => {
        console.error("Erro: ", error);
      });
  });

  // ALTERAÇÃO EM TESTE para destituir
  document
    .getElementById("btn-destituir-funcionario")
    .addEventListener("click", function () {
      const id_f = selectFuncionario.value;
      const id_p = selectProjeto.value;

      fetch(`${baseUrl}/atribuir-funcionario/${id_f}/${id_p}`, {
        method: "DELETE",
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message);
        })
        .then(() => {
          carregarProjetosComFuncionarios();
          formAtribuicao.reset();
        })
        .catch((error) => {
          console.error("Erro: ", error);
        });
    });
  //

  // Editar Funcionário
  listaFuncionarios.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
      const id = e.target.getAttribute("data-id");

      fetch(`${baseUrl}/funcionarios/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((funcionario) => {
          const isoDate = funcionario.data_contratacao;
          const formattedDate = formatDateToYYYYMMDD(isoDate);
          document.getElementById("id-funcionario").value = funcionario.id;
          document.getElementById("editar-nome").value = funcionario.nome;
          document.getElementById("editar-cargo").value = funcionario.cargo;
          document.getElementById("editar-email").value = funcionario.email;
          document.getElementById("editar-data_contratacao").value =
            formattedDate;
        })
        .catch((error) => {
          console.error("Erro ao carregar funcionário para edição:", error);
        });
    }
  });

  formEditarFuncionario.addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("id-funcionario").value;
    const nome = document.getElementById("editar-nome").value;
    const cargo = document.getElementById("editar-cargo").value;
    const email = document.getElementById("editar-email").value;
    const dataContratacao = document.getElementById(
      "editar-data_contratacao"
    ).value;

    fetch(`${baseUrl}/funcionarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        cargo,
        email,
        data_contratacao: dataContratacao,
      }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
      })
      .then(() => {
        carregarFuncionarios();
        formEditarFuncionario.reset();
      });
  });

  document
    .getElementById("btn-excluir-funcionario")
    .addEventListener("click", function () {
      const id = document.getElementById("id-funcionario").value;

      fetch(`${baseUrl}/funcionarios/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message);
        })
        .then(() => {
          carregarFuncionarios();
          carregarProjetosComFuncionarios();
          formEditarFuncionario.reset();
        });
    });

  // Editar Projeto
  listaProjetos.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
      const id = e.target.getAttribute("data-id");

      fetch(`${baseUrl}/projetos/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((projeto) => {
          const isoDateIni = projeto.data_inicio;
          const isoDateFim = projeto.data_fim;
          const formattedDateIni = formatDateToYYYYMMDD(isoDateIni);
          const formattedDateFim = formatDateToYYYYMMDD(isoDateFim);
          document.getElementById("id-projeto").value = projeto.id;
          document.getElementById("editar-nome-projeto").value = projeto.Nome;
          document.getElementById("editar-descricao").value = projeto.descricao;
          document.getElementById("editar-data_inicio").value =
            formattedDateIni;
          document.getElementById("editar-data_fim").value = formattedDateFim;
        })
        .catch((error) => {
          console.error("Erro ao carregar Projetos para edição:", error);
        });
    }
  });

  formEditarProjeto.addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("id-projeto").value;
    const nome = document.getElementById("editar-nome-projeto").value;
    const descricao = document.getElementById("editar-descricao").value;
    const dataInicio = document.getElementById("editar-data_inicio").value;
    const dataFim = document.getElementById("editar-data_fim").value;

    fetch(`${baseUrl}/projetos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        descricao,
        data_inicio: dataInicio,
        data_fim: dataFim,
      }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
      })
      .then(() => {
        carregarProjetos();
        carregarProjetosComFuncionarios();
        formEditarProjeto.reset();
      });
  });

  document
    .getElementById("btn-excluir-projeto")
    .addEventListener("click", function () {
      const id = document.getElementById("id-projeto").value;

      fetch(`${baseUrl}/projetos/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message);
        })
        .then(() => {
          carregarProjetos();
          carregarProjetosComFuncionarios();
          formEditarProjeto.reset();
        });
    });
  //

  // Carregar os dados iniciais no Front End
  carregarFuncionarios();
  carregarProjetos();
  carregarProjetosComFuncionarios();
});
