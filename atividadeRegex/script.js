/**
 * @import * from '../lib/convertions';
 */

/**
 * @type HTMLInputElement
 */
const inputRegex = document.getElementById("input_regex");
/**
 * @type HTMLInputElement
 */
const inputTest = document.getElementById("input_test");

// Resetting
inputRegex.value = "^Exemplo$"
inputTest.value = "Exemplo"

let regexIsValid = true;
let regexObject = new RegExp("");

function validateRegExpInput() {
  if (inputRegex.value == "") {
    inputRegex.style.color = "black";
    regexIsValid = true;
    return;
  }

  try {
    regexObject = new RegExp(inputRegex.value);
    inputRegex.style.color = "green";
    // inputRegex.style.backgroundColor = "#90EE90"
    regexIsValid = true;
  } catch (e) {
    inputRegex.style.color = "red";
    regexIsValid = false;
  }
}

function validateTestInput() {
  if (regexIsValid) {
    if (regexObject.test(inputTest.value)) {
      inputTest.style.color = "green";
      inputTest.style.backgroundColor = "#90EE90"
    } else {
      inputTest.style.color = "red";
      inputTest.style.backgroundColor = "#FF7F7F"
    }
  }
}

function validateBoth() {
  validateRegExpInput();
  validateTestInput();
}

inputRegex.addEventListener("input", validateBoth);
inputTest.addEventListener("input", validateTestInput);

validateBoth();

// Converte em gramática regular, salva na sessão do navegador e move para a página de atividade de gramática regular
function generateGrammar() {
  const inputRegexValue = inputRegex.value;
  // Alerta em caso de letra maiúscula

  if (inputRegexValue.match(/[A-Z]/)) {
    alert("Para realizar conversão de expressões regulares para gramáticas regulares, é necessário que a expressão regular seja composta apenas por letras minúsculas.");
    return;
  }

  const generatedRules = changeStatesToLetters(regexToGrammar(inputRegex.value));
  window.sessionStorage.setItem("generatedRules", JSON.stringify(generatedRules));
  const currentHref = window.location.href;
  // remove two last paths
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeGramaticaRegular/index.html";
  window.location.href = newPath;
}