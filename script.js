const cpfsCadastrados = [
  "000.000.000-00",
  "111.111.111-11",
  "123.456.789-09",
  "987.654.321-00",
];

function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const [ano, mes, dia] = dataNascimento.split("-").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const diffMes = hoje.getMonth() - nascimento.getMonth();
  if (diffMes < 0 || (diffMes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

function normalizarCPF(cpf) {
  return cpf.replace(/\D/g, "");
}

function cpfIgual(cpfA, cpfB) {
  return normalizarCPF(cpfA) === normalizarCPF(cpfB);
}

function cpfDuplicado(cpf) {
  return cpfsCadastrados.some((c) => cpfIgual(c, cpf));
}

function motivoGenerico(texto) {
  const motivosProibidos = [
    /^\s*quero\s*$/i,
    /^\s*porque\s+sim\s*$/i,
    /^\s*sim\s*$/i,
    /^\s*não\s+sei\s*$/i,
    /^\s*gosto\s*$/i,
    /^\s*por\s+que\s+sim\s*$/i,
  ];
  const textoLimpo = texto.trim();
  if (textoLimpo.length < 20) return true;
  return motivosProibidos.some((r) => r.test(textoLimpo));
}

function telefoneValido(tel) {
  const limpo = tel.replace(/\D/g, "");
  return limpo.length === 10 || limpo.length === 11;
}

function semCondicoesFinanceiras(texto) {
  const padroes = [
    /sem\s+dinheiro/i,
    /sem\s+condi[cç][oõ]es\s+financeiras/i,
    /n[aã]o\s+tenho\s+dinheiro/i,
    /desempregado/i,
    /n[aã]o\s+posso\s+pagar/i,
    /n[aã]o\s+tenho\s+renda/i,
  ];
  return padroes.some((p) => p.test(texto));
}

function decisaoImpulsiva(texto) {
  const padroes = [
    /hoje/i,
    /agora/i,
    /agora\s+mesmo/i,
    /nesse\s+momento/i,
    /decidi\s+hoje/i,
    /acabei\s+de\s+decidir/i,
    /vi\s+hoje/i,
  ];
  return padroes.some((p) => p.test(texto));
}


function atualizarCamposDinamicos() {
  const tipoMoradia = document.querySelector('input[name="housetype"]:checked')?.value;
  const temQuintal = document.getElementById("backyard").checked;

  removerCampoExtra("permitAnimais");
  removerCampoExtra("quintalSeguro");
  removerCampoExtra("espacoExterno");

  if (tipoMoradia === "AP") {
    if (temQuintal) {
      document.getElementById("backyard").checked = false;
      exibirAlerta("Moradores de apartamento não podem indicar que possuem quintal. O campo foi desmarcado.", "warning");
    }
    adicionarCampoRadio("permitAnimais", "O condomínio permite animais?", [
      { id: "animaisSimAP", value: "sim", label: "Sim" },
      { id: "animaisNaoAP", value: "nao", label: "Não" },
    ]);
  }

  if (tipoMoradia === "house") {
    adicionarCampoRadio("quintalSeguro", "O quintal é seguro (cercado/sem riscos)?", [
      { id: "quintalSimH", value: "sim", label: "Sim" },
      { id: "quintalNaoH", value: "nao", label: "Não" },
    ]);

    if (temQuintal) {
      adicionarCampoRadio("espacoExterno", "O espaço externo é adequado para o pet?", [
        { id: "espacoSimH", value: "sim", label: "Sim" },
        { id: "espacoNaoH", value: "nao", label: "Não" },
      ]);
    }
  }
}

function adicionarCampoRadio(id, labelText, opcoes) {
  if (document.getElementById(id + "-wrapper")) return;

  const backyard = document.querySelector(".backyard.camps");
  const wrapper = document.createElement("div");
  wrapper.className = "camps extra-field";
  wrapper.id = id + "-wrapper";

  const label = document.createElement("label");
  label.textContent = labelText;
  wrapper.appendChild(label);

  opcoes.forEach((op) => {
    const lbl = document.createElement("label");
    lbl.setAttribute("for", op.id);
    lbl.textContent = op.label;

    const input = document.createElement("input");
    input.type = "radio";
    input.id = op.id;
    input.name = id;
    input.value = op.value;

    wrapper.appendChild(lbl);
    wrapper.appendChild(input);
  });

  backyard.insertAdjacentElement("afterend", wrapper);
}

function removerCampoExtra(id) {
  const el = document.getElementById(id + "-wrapper");
  if (el) el.remove();
}


function exibirAlerta(mensagem, tipo = "error") {
  let alertBox = document.getElementById("alertBox");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alertBox";
    document.querySelector(".formContainer").prepend(alertBox);
  }

  const item = document.createElement("p");
  item.className = "alerta alerta-" + tipo;
  item.textContent = mensagem;
  alertBox.appendChild(item);
}

function limparAlertas() {
  const alertBox = document.getElementById("alertBox");
  if (alertBox) alertBox.innerHTML = "";
}


document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  limparAlertas();

  let bloqueado = false;

  const bDay = document.getElementById("bDay").value;
  if (bDay) {
    const idade = calcularIdade(bDay);
    if (idade < 18) {
      exibirAlerta(`Você precisa ter pelo menos 18 anos para adotar. Idade detectada: ${idade} anos.`);
      bloqueado = true;
    }
  } else {
    exibirAlerta("Informe sua data de nascimento.");
    bloqueado = true;
  }

  const telefone = document.getElementById("phone").value;
  if (!telefoneValido(telefone)) {
    exibirAlerta("Telefone inválido. Informe um número válido com DDD (ex: (47) 99999-9999).");
    bloqueado = true;
  }

  const cpf = document.getElementById("cpf").value;
  if (cpfDuplicado(cpf)) {
    exibirAlerta("Este CPF já está cadastrado em nosso sistema.");
    bloqueado = true;
  }

  const tipoMoradia = document.querySelector('input[name="housetype"]:checked')?.value;
  const temQuintal = document.getElementById("backyard").checked;

  if (!tipoMoradia) {
    exibirAlerta("Informe o tipo de moradia.");
    bloqueado = true;
  }

  if (tipoMoradia === "AP") {
    if (temQuintal) {
      exibirAlerta("Incoerência: moradores de apartamento não podem indicar que possuem quintal.");
      bloqueado = true;
    }

    const permiteAnimais = document.querySelector('input[name="permitAnimais"]:checked')?.value;
    if (!permiteAnimais) {
      exibirAlerta("Informe se o seu condomínio permite animais.");
      bloqueado = true;
    } else if (permiteAnimais === "nao") {
      exibirAlerta("Seu condomínio não permite animais. A adoção não pode prosseguir.");
      bloqueado = true;
    }
  }

  if (tipoMoradia === "house") {
    const quintalSeguro = document.querySelector('input[name="quintalSeguro"]:checked')?.value;
    if (!quintalSeguro) {
      exibirAlerta("Informe se o seu quintal é seguro para o animal.");
      bloqueado = true;
    } else if (quintalSeguro === "nao") {
      exibirAlerta("Atenção: quintal sem segurança pode colocar o animal em risco. A candidatura será analisada com ressalvas.", "warning");
    }
  }

  const horasAlone = parseInt(document.getElementById("hoursAlone").value, 10);
  if (horasAlone > 8) {
    const justificativa = prompt(
      `O animal ficará ${horasAlone}h sozinho por dia — acima do recomendado (8h).\n\nForneca uma justificativa adicional para analisarmos sua candidatura:`
    );
    if (!justificativa || justificativa.trim().length < 10) {
      exibirAlerta("Justificativa insuficiente para o animal ficar mais de 8h sozinho por dia.");
      bloqueado = true;
    } else {
      exibirAlerta(`Candidatura com ressalva: animal ficará ${horasAlone}h sozinho. Justificativa registrada.`, "warning");
    }
  }

  const petBefore = document.querySelector('input[name="petBefore"]:checked')?.value;
  if (petBefore === "noPB") {
    exibirAlerta(
      "ℹ️ Como você nunca teve um pet, nossa ONG poderá realizar um acompanhamento periódico para garantir o bem-estar do animal.",
      "info"
    );
  }

  const motive = document.getElementById("motive").value;
  if (motivoGenerico(motive)) {
    exibirAlerta("O motivo da adoção está muito genérico. Por favor, escreva pelo menos 20 caracteres explicando sua motivação.");
    bloqueado = true;
  }

  if (semCondicoesFinanceiras(motive)) {
    exibirAlerta("Identificamos menção a dificuldades financeiras no seu relato. Ter um pet gera custos com alimentação, saúde e bem-estar. Sua candidatura será analisada com atenção especial.", "warning");
  }

  if (decisaoImpulsiva(motive)) {
    exibirAlerta("Parece que a decisão de adotar pode ter sido tomada de forma repentina. Adotar é um compromisso de longo prazo — tem certeza?", "warning");
  }

  const terms = document.getElementById("terms").checked;
  if (!terms) {
    exibirAlerta("Você precisa aceitar os Termos e Condições para enviar o formulário.");
    bloqueado = true;
  }

  if (!bloqueado) {
    const alertBox = document.getElementById("alertBox");
    if (!alertBox || alertBox.querySelectorAll(".alerta-error").length === 0) {
      exibirAlerta("Formulário enviado com sucesso! Entraremos em contato em breve.", "success");
    }
  } else {
    document.getElementById("alertBox").scrollIntoView({ behavior: "smooth" });
  }
});


document.querySelectorAll('input[name="housetype"]').forEach((radio) => {
  radio.addEventListener("change", atualizarCamposDinamicos);
});

document.getElementById("backyard").addEventListener("change", atualizarCamposDinamicos);

(function injetarEstilos() {
  const style = document.createElement("style");
  style.textContent = `
    #alertBox { margin-bottom: 16px; }
    .alerta {
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    .alerta-error   { background: #ffe0e0; color: #b00020; border-left: 4px solid #b00020; }
    .alerta-warning { background: #fff3cd; color: #856404; border-left: 4px solid #f0ad4e; }
    .alerta-info    { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }
    .alerta-success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
    .extra-field    { margin-top: 12px; }
  `;
  document.head.appendChild(style);
})();