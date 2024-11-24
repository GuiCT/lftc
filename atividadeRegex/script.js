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
inputRegex.value = "^Exemplo$";
inputTest.value = "Exemplo";

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
      inputTest.style.backgroundColor = "#90EE90";
    } else {
      inputTest.style.color = "red";
      inputTest.style.backgroundColor = "#FF7F7F";
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