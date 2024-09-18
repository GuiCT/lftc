const list = document.getElementById("list");
const resultTree = document.getElementById('result-tree');
const rulePattern = new RegExp("^[a-z]*[A-Z]?$");
const addRuleButton = document.getElementById("add-rule");

function renderListComponent() {
  const li = document.createElement("li");
  li.classList.add("rule");
  const productionInput = document.createElement("input");
  productionInput.setAttribute("type", "text");
  productionInput.setAttribute("placeholder", "S");
  productionInput.setAttribute("maxlength", "1");
  const arrow = document.createElement("span");
  arrow.innerText = "->";
  const rule = document.createElement("input");
  rule.setAttribute("type", "text");
  rule.setAttribute("placeholder", "λ");
  rule.oninput = () => validateAllRules();
  const removeButton = document.createElement("button");
  removeButton.innerText = "Remover regra";
  removeButton.onclick = () => li.remove();
  li.appendChild(productionInput);
  li.appendChild(arrow);
  li.appendChild(rule);
  li.appendChild(removeButton);
  return li;
}

function validateRule(element) {
  const valid = rulePattern.test(element.value);

  if (valid) {
    element.classList.remove("error");
  }
  else {
    element.classList.add("error");
  }

  return valid;
};

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
      resultTree.innerText = 'Regras inválidas';
    }
  }

  return !hasInvalidRule;
};

function displayTree(tree) {
  if (!tree.subtrees || tree.subtrees.length == 0)
    return '<li><a href="#" class=\'green-bg\'>' + tree.root + '</a></li>';

  const builder = [];
  builder.push('<li><a href="#">');
  builder.push(tree.root);
  builder.push('</a>');
  builder.push('<ul>');
  for (const subtree in tree.subtrees)
    builder.push(displayTree(tree.subtrees[subtree]));
  builder.push('</ul>');
  builder.push('</li>');
  return builder.join('');
};

function getUserInput() {
  /**
   * @type {HTMLInputElement}
   */
  const userInput = document.getElementById("user-input");
  const val = userInput.value;
  const chars = val.split("");
  chars.push("λ")
  return chars;
};

function validateInput() {
  if (!validateAllRules()) {
    return;
  }

  const rules = document.querySelectorAll(".rule");
  const parsedRules = ['🏁 -> S'], usedLeftSide = ['🏁'];
  for (const rule of rules) {
    const children = rule.getElementsByTagName('input');
    const lv = children[0].value;
    let rv = children[1].value.split("").join(" ");
    const indexLv = usedLeftSide.indexOf(lv);

    if (rv === "") {
      rv = "λ";
    }

    if (indexLv === -1) {
      usedLeftSide.push(lv);
      parsedRules.push(lv + " -> " + rv);
      continue;
    }

    parsedRules[indexLv] += " | " + rv;
  }

  const tokenStream = getUserInput();

  const grammar = new REGULAR_GRAMMAR.Grammar(parsedRules);

  const rootProduction = '🏁';
  const chart = REGULAR_GRAMMAR.parse(
    tokenStream,
    grammar,
    rootProduction,
  );

  const state = chart.getFinishedRoot(rootProduction);
  resultTree.innerHTML = '';
  if (state) {
    const trees = state.traverse()['0'].subtrees;
    for (const tree in trees) {
      resultTree.innerHTML +=
        '<div class="tree" id="displayTree"><ul>' +
        displayTree(trees[tree]) +
        '</ul></div></br>';
    }
    return true;
  }

  resultTree.innerText = 'Entrada inválida'
};

addRuleButton.addEventListener("click", (e) => {
  e.preventDefault();
  list.appendChild(renderListComponent());
});