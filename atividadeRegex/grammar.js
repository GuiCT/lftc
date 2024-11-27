// Converte em gramática regular, salva na sessão do navegador e move para a página de atividade de gramática regular
function generateGrammar() {
  const inputRegexValue = inputRegex.value;
  // Alerta em caso de letra maiúscula

  if (inputRegexValue.match(/[A-Z]/)) {
    alert(
      "Para realizar conversão de expressões regulares para gramáticas regulares, é necessário que a expressão regular seja composta apenas por letras minúsculas."
    );
    return;
  }

  const generatedRules = changeStatesToLetters(
    regexToGrammar(inputRegex.value)
  );
  window.sessionStorage.setItem(
    "generatedRules",
    JSON.stringify(generatedRules)
  );
  const currentHref = window.location.href;
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeGramaticaRegular/index.html";
  window.location.href = newPath;
}

if (sessionStorage.getItem("grammarToRegex")) {
  const regex = JSON.parse(sessionStorage.getItem("grammarToRegex"));
  console.log(regex);
  console.log(grammarToRegex(regex));
  document.getElementById("input_regex").value = grammarToRegex(regex);
  sessionStorage.removeItem("grammarToRegex");
}
