const list = document.getElementById("list");
const resultTree = document.getElementById('result');
const rulePattern = new RegExp("^[a-z]*[A-Z]?$");
const addRuleButton = document.getElementById("add-rule");

// Model for the rule line
const ruleModel = document.getElementsByClassName("rule")[0].cloneNode(true);
ruleModel.children[0].removeAttribute("readonly");
ruleModel.children[0].value = "";
ruleModel.children[2].value = "";
ruleModel.children[3].removeAttribute("disabled");

function renderListComponent() {
  const newRule = ruleModel.cloneNode(true);
  newRule.children[3].addEventListener("click", (e) => {
    e.preventDefault();
    newRule.remove();
  });
  return newRule;
}

function validateRule(element) {
  const valid = rulePattern.test(element.value);

  if (valid) {
    element.classList.remove("error");
  } else {
    element.classList.add("error");
  }

  return valid;
}

function validateAllRules() {
  const rules = document.getElementsByClassName("rule");
  let hasInvalidRule = false;

  for (const rule of rules) {
    const rightValueInput = rule.getElementsByTagName('input')[1];
    const isValidRule = validateRule(rightValueInput);

    if (!isValidRule) {
      hasInvalidRule = true;
    }
  }

  if (resultTree) {
    resultTree.innerText = '';

    if (hasInvalidRule) {
      resultTree.innerText = 'Invalid rules';
    }
  }

  return !hasInvalidRule;
}

function buildRegex() {
  if (!validateAllRules()) {
    return;
  }

  const rules = document.querySelectorAll(".rule");
  const regexParts = [];

  for (const rule of rules) {
    const children = rule.getElementsByTagName('input');
    const lv = children[0].value.trim();  // Left value (not needed in regex)
    let rv = children[1].value.trim();    // Right value

    // Convert rule into regex format, appending λ if no uppercase symbol
    if (!rv.match(/[A-Z]$/)) {
      rv += "(λ)?";  // Make the lambda optional to allow empty sequences
    }

    regexParts.push(rv);  // Collect each part as an alternative
  }

  // Combine all rule parts into one regex string with alternatives (|)
  const combinedRegex = `^(${regexParts.join('|')})$`;

  // Display the resulting regex
  resultTree.innerText = `Generated Regex: ${combinedRegex}`;
  return combinedRegex;
}

addRuleButton.addEventListener("click", (e) => {
  e.preventDefault();
  list.appendChild(renderListComponent());
});

document.getElementById("generate-regex").addEventListener("click", (e) => {
  e.preventDefault();
  buildRegex();
});
