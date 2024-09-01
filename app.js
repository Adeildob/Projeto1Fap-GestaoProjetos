/**
 * Importação e configuração inicial
 *
 * express: Framework para criar aplicações web em Node.js.
 * cors: Middleware para permitir requisições de diferentes origens (Cross-Origin Resource Sharing).
 * mysql2: Biblioteca para conexão com o banco de dados MySQL.
 * bodyParser: Middleware para analisar o corpo das requisições HTTP (agora integrado ao Express).
 */
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const bodyParser = require("body-parser");

/**
 * Configuração do Middleware
 *
 * Habilitar CORS para todas as rotas (requisições de outros domínios)
 * app.use(cors()): Permite que o servidor app.use(cors()): Permite que o servidor aceite requisições de outros domínios.
 * app.use(bodyParser.json()): Analisa JSON no corpo das requisições para que req.body contenha os dados da requisição.
 */
app.use(cors());
app.use(bodyParser.json());

// Criação da conexão com o banco de dados MySQL a partir dos parâmetros
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "mydb",
// });

require("dotenv").config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const db = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

// Conexão com o banco de dados MySQL
db.connect((err) => {
  if (err) throw err;
  console.log("Conectado ao banco de dados MySQL");
});

/**
 * Definição das Rotas
 *
 * Rotas para Funcionarios
 * Rota GET para LISTAR funcionários
 */
app.get("/funcionarios", (req, res) => {
  db.query("SELECT * FROM Funcionarios", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

/**
 * Rota POST para ADICIONAR funcionários
 */
app.post("/funcionarios", (req, res) => {
  const funcionario = req.body;
  console.log(req.body);
  db.query("INSERT INTO Funcionarios SET ?", funcionario, (err, result) => {
    if (err) throw err;
    res.send("Funcionário adicionado com sucesso.");
  });
});

/**
 * Rota GET para OBTER um funcionário específico pelo ID
 */
app.get("/funcionarios/:id", (req, res) => {
  //validação de recebimento da requisição do FrontEnd
  console.log(`Recebendo solicitação para ID: ${req.params.id}`);

  const { id } = req.params;

  db.query("SELECT * FROM Funcionarios WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar funcionário:", err);
      return res.status(500).send("Erro ao buscar funcionário.");
    }
    if (results.length === 0) {
      return res.status(404).send("Funcionário não encontrado.");
    }
    res.json(results[0]);
  });
});

/**
 * Rota PUT para ATUALIZAR dados de um funcionário específico pelo ID
 */
app.put("/funcionarios/:id", (req, res) => {
  const { id } = req.params;
  const funcionario = req.body;
  db.query(
    "UPDATE Funcionarios SET ? WHERE id = ?",
    [funcionario, id],
    (err, result) => {
      if (err) throw err;
      res.send("Funcionário atualizado com sucesso.");
    }
  );
});

/**
 * Rota DELETE para REMOVER um funcionário específico pelo ID
 */
app.delete("/funcionarios/:id", (req, res) => {
  const { id } = req.params;

  // Inicia uma transação para garantir que a exclusão do funcionário e de suas referências em funcionarioprojeto sejam atômicas.
  db.beginTransaction((err) => {
    if (err) throw err;

    // REMOVE o funcionário da tabela `funcionarioprojeto`
    db.query(
      "DELETE FROM funcionarioprojeto WHERE Funcionarios_id = ?",
      [id],
      (err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }

        //REMOVE o funcionário da tabela `funcionarios`
        db.query(
          "DELETE FROM Funcionarios WHERE id = ?",
          [id],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                throw err;
              });
            }

            // Commit a transação se tudo estiver ok
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  throw err;
                });
              }

              res.send("Funcionário excluído com sucesso.");
            });
          }
        );
      }
    );
  });
});

/**
 * Rotas para Projetos
 * Rota GET para LISTAR todos os projetos
 */
app.get("/projetos", (req, res) => {
  db.query("SELECT * FROM Projetos", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

/**
 * Rota POST para ADICIONAR um projeto
 */
app.post("/projetos", (req, res) => {
  const projeto = req.body;

  // Validação do campo nome
  if (
    !projeto.nome ||
    typeof projeto.nome !== "string" ||
    projeto.nome.length < 5 ||
    projeto.nome.length > 45
  ) {
    return res
      .status(400)
      .send("O campo 'nome' é obrigatório e deve ter entre 5 e 45 caracteres.");
  }

  // Validação do campo descrição
  if (
    !projeto.descricao ||
    typeof projeto.descricao !== "string" ||
    projeto.descricao.length < 10 ||
    projeto.descricao.length > 100
  ) {
    return res
      .status(400)
      .send(
        "O campo 'descrição' é obrigatório e deve ter entre 10 e 100 caracteres."
      );
  }

  db.query("INSERT INTO Projetos SET ?", projeto, (err, result) => {
    if (err) throw err;
    res.send("Projeto adicionado com sucesso.");
  });
});

/**
 * Rota GET para OBTER um projeto específico por ID
 */
app.get("/projetos/:id", (req, res) => {
  //validação
  console.log(`Recebendo solicitação para ID: ${req.params.id}`);
  const { id } = req.params;

  db.query("SELECT * FROM Projetos WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar projeto:", err);
      return res.status(500).send("Erro ao buscar projeto.");
    }
    if (results.length === 0) {
      return res.status(404).send("Projeto não encontrado.");
    }
    res.json(results[0]);
  });
});

/**
 * Rota PUT para ATUALIZAR dados de um projeto específico por ID
 */
app.put("/projetos/:id", (req, res) => {
  const { id } = req.params;
  const projeto = req.body;

  // Validação do campo nome
  if (
    !projeto.nome ||
    typeof projeto.nome !== "string" ||
    projeto.nome.length < 5 ||
    projeto.nome.length > 45
  ) {
    return res
      .status(400)
      .send("O campo 'nome' é obrigatório e deve ter entre 5 e 45 caracteres.");
  }

  // Validação do campo descrição
  if (
    !projeto.descricao ||
    typeof projeto.descricao !== "string" ||
    projeto.descricao.length < 10 ||
    projeto.descricao.length > 100
  ) {
    return res
      .status(400)
      .send(
        "O campo 'descrição' é obrigatório e deve ter entre 10 e 100 caracteres."
      );
  }

  db.query(
    "UPDATE Projetos SET ? WHERE id = ?",
    [projeto, id],
    (err, result) => {
      if (err) throw err;
      res.send("Projeto atualizado com sucesso.");
    }
  );
});

/**
 * Rota DELETE para REMOVER um projeto específico por ID
 */
app.delete("/projetos/:id", (req, res) => {
  const { id } = req.params;

  // Verificar se o id é válido
  if (!id) {
    return res.status(400).send("ID do projeto não fornecido.");
  }

  // Inicia uma transação para garantir que a exclusão do projeto e suas referências em funcionarioprojeto sejam atômicas.
  db.beginTransaction((err) => {
    if (err) {
      console.error("Erro ao iniciar a transação:", err);
      return res.status(500).send("Erro ao iniciar a transação.");
    }

    // Excluir referências na tabela `funcionarioprojeto`
    db.query(
      "DELETE FROM funcionarioprojeto WHERE Projetos_id = ?",
      [id],
      (err) => {
        if (err) {
          console.error("Erro ao excluir referências:", err);
          return db.rollback(() => {
            res.status(500).send("Erro ao excluir referências.");
          });
        }

        // Excluir o projeto na tabela `Projetos`
        db.query("DELETE FROM projetos WHERE id = ?", [id], (err) => {
          if (err) {
            console.error("Erro ao excluir o projeto:", err);
            return db.rollback(() => {
              res.status(500).send("Erro ao excluir o projeto.");
            });
          }

          // Commit a transação se tudo estiver ok
          db.commit((err) => {
            if (err) {
              console.error("Erro ao fazer commit:", err);
              return db.rollback(() => {
                res.status(500).send("Erro ao finalizar a transação.");
              });
            }

            res.send("Projeto excluído com sucesso.");
          });
        });
      }
    );
  });
});

/**
 * Rotas para FuncionarioProjeto
 * Rota GET para LISTAR todas as atribuições de funcionários a projetos
 */
app.get("/atribuir-funcionario", (req, res) => {
  db.query("SELECT * FROM funcionarioprojeto", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

/**
 * Rota POST para ATRIBUIR um funcionário a um projeto
 */
app.post("/atribuir-funcionario", (req, res) => {
  const { funcionarios_id, projetos_id } = req.body;

  // Verificar se o funcionário já está atribuído ao projeto
  const checkQuery = `
      SELECT * FROM FuncionarioProjeto 
      WHERE Funcionarios_id = ? AND Projetos_id = ?
    `;

  db.query(checkQuery, [funcionarios_id, projetos_id], (err, results) => {
    if (err) {
      console.error("Erro ao verificar atribuição:", err);
      return res.status(500).send("Erro ao verificar atribuição.");
    }

    if (results.length > 0) {
      // Se já existe uma atribuição, retornar uma mensagem apropriada
      return res
        .status(400)
        .send("Funcionário já está atribuído a este projeto.");
    }

    // Se não existe atribuição, realizar a inserção
    const insertQuery = `
        INSERT INTO FuncionarioProjeto (funcionarios_id, projetos_id)
        VALUES (?, ?)
      `;

    db.query(insertQuery, [funcionarios_id, projetos_id], (err, result) => {
      if (err) {
        console.error("Erro ao atribuir projeto:", err);
        return res.status(500).send("Erro ao atribuir projeto.");
      }

      // Enviar mensagem de sucesso se a operação for bem-sucedida
      res.send("Funcionário atribuído ao projeto com sucesso.");
    });
  });
});

/**
 * Rota DELETE para REMOVER um funcionário de um projeto específico
 */
app.delete("/atribuir-funcionario/:id_f/:id_p", (req, res) => {
  const { id_f, id_p } = req.params;
  console.log(req.params);

  const checkQuery = `
      SELECT * FROM FuncionarioProjeto 
      WHERE Funcionarios_id = ? AND Projetos_id = ?`;

  db.query(checkQuery, [id_f, id_p], (err, results) => {
    console.log(err);
    console.log(results.length);
    if (err) {
      console.error("Erro ao verificar destituição:", err);
      return res.status(500).send("Erro ao verificar destituição.");
    }

    if (results.length === 0) {
      // Não existe uma atribuição, retornar uma mensagem apropriada
      return res
        .status(400)
        .send("Funcionário não está atribuído a este projeto.");
    }

    // Se não existe atribuição, realizar a inserção
    // Excluir referências na tabela `funcionarioprojeto`
    db.query(
      "DELETE FROM funcionarioprojeto WHERE Funcionarios_id = ? AND Projetos_id = ?",
      [id_f, id_p],
      (err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }
        res.send("Funcionário destituído do projeto.");
      }
    );
  });
});
//

/**
 * Rota GET para LISTAR um(mais) projeto(s) e seu(s) funcionário(s)
 */
app.get("/projetos-com-funcionarios", (req, res) => {
  const query = `
      SELECT 
        p.id AS projeto_id, 
        p.nome AS projeto_nome, 
        f.id AS funcionario_id, 
        f.nome AS funcionario_nome 
      FROM Projetos p
      LEFT JOIN FuncionarioProjeto fp ON p.id = fp.projetos_id
      LEFT JOIN Funcionarios f ON fp.funcionarios_id = f.id
      ORDER BY p.id;
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar projetos com funcionários:", err);
      return res.status(500).send("Erro ao buscar dados.");
    }

    // Agrupa os funcionários por projeto usando o método reduce para organizar a resposta no formato desejado
    /**
     * 1. Uso do reduce
     *
     * O método reduce é usado para transformar um array em um único valor ou estrutura. No caso, o array é
     * results e o objetivo é transformá-lo em um objeto onde cada chave é um ID de projeto e o valor é um
     * objeto que contém os detalhes do projeto e uma lista de funcionários associados.
     *
     * acc: Acumulador que armazena o estado intermediário da transformação. Inicialmente é um objeto vazio {}.
     * curr: O valor atual do array results durante cada iteração do reduce.
     *
     * 2. Desestruturação dos Dados
     *
     * Para cada item curr do array results, as seguintes variáveis são extraídas:
     */
    const projetosComFuncionarios = results.reduce((acc, curr) => {
      const { projeto_id, projeto_nome, funcionario_id, funcionario_nome } =
        curr;

      /**
       * Verificação e criação de projetos
       *
       * if (!acc[projeto_id]): Verifica se o projeto com o ID projeto_id ainda não foi adicionado ao acumulador acc.
       * acc[projeto_id] = { projeto_id, projeto_nome, funcionarios: [] }: Se não existir, cria uma nova entrada no
       * acumulador com o ID do projeto, o nome do projeto e uma lista vazia para os funcionários.
       */
      if (!acc[projeto_id]) {
        acc[projeto_id] = {
          projeto_id,
          projeto_nome,
          funcionarios: [],
        };
      }

      /**
       * Adição de Funcionários
       *
       * if (funcionario_id): Verifica se o funcionario_id está presente (não é null ou undefined), indicando que o projeto tem
       * funcionários associados.
       * acc[projeto_id].funcionarios.push({ funcionario_id, funcionario_nome }): Adiciona um novo objeto com os detalhes do funcionário
       *  à lista de funcionários do projeto correspondente.
       */
      if (funcionario_id) {
        acc[projeto_id].funcionarios.push({ funcionario_id, funcionario_nome });
      }

      /**
       * Após processar todos os itens do array results, o acumulador acc é retornado como o resultado da transformação.
       */
      return acc;
    }, {});

    /**
     * Conversão para Array e Envio da Resposta
     *
     * Object.values(projetosComFuncionarios): Converte o objeto projetosComFuncionarios em um array de valores. Cada valor
     * é um objeto representando um projeto e seus funcionários.
     * res.json(...): Envia o resultado como resposta JSON para o cliente.
     *
     * Ao final desse processamento, você obtém um array onde cada elemento representa um projeto e inclui uma lista de funcionários
     *  associados a esse projeto. Isso facilita a visualização dos dados no frontend, mostrando claramente quais funcionários estão
     * associados a quais projetos.
     */
    res.json(Object.values(projetosComFuncionarios));
  });
});

/**
 *Inicialização do Servidor

 *  app.listen(3000): Inicia o servidor Express na porta 3000 e exibe uma mensagem no console indicando que o servidor está rodando.
*/
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
