function generateAutomata() {
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
    "regexToAutomata",
    JSON.stringify(generatedRules)
  );
  const currentHref = window.location.href;
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeGramaticaRegular/index.html";
  window.location.href = newPath;
}
