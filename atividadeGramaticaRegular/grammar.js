const list = document.getElementById("list");
const resultTree = document.getElementById('result');
const rulePattern = new RegExp("^[a-z]*[A-Z]?$");
const addRuleButton = document.getElementById("add-rule");

// Instanciando modelo para linha da regra
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

function composeTreeElement(tree) {
  const hasSubtrees = tree.subtrees && tree.subtrees.length > 0;
  const treeElement = document.createElement('li');
  const anchor = document.createElement('a');
  anchor.href = '#';
  anchor.innerText = tree.root;
  treeElement.appendChild(anchor);

  // Quando não há mais nenhuma sub-árvore, chegamos em uma folha
  if (!hasSubtrees) {
    return treeElement;
  }

  const ul = document.createElement('ul');
  for (const subtree in tree.subtrees) {
    const subtreeElement = composeTreeElement(tree.subtrees[subtree]);
    ul.appendChild(subtreeElement);
  }

  treeElement.appendChild(ul);
  return treeElement;
}

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
    const rvRawValue = children[1].value;
    let rv = rvRawValue.split("").join(" ");
    // Se o valor da direita não encerrar em uma produção (maiuscúlo), adicionar λ ao fim
    // O trim é feito para caso a produção seja vazia
    if (!rvRawValue.match(/[A-Z]$/)) {
      rv += " λ";
      rv = rv.trim();
    }
    const indexLv = usedLeftSide.indexOf(lv);

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
  // remove all children
  while (resultTree.firstChild) {
    resultTree.removeChild(resultTree.firstChild);
  }

  if (state) {
    const trees = state.traverse()['0'].subtrees;
    for (const tree in trees) {
      const newDiv = document.createElement('div');
      newDiv.classList.add('tree');
      newDiv.id = 'displayTree';
      const treeList = document.createElement('ul');
      const treeElement = composeTreeElement(trees[tree]);
      treeList.appendChild(treeElement);
      newDiv.appendChild(treeList);
      resultTree.appendChild(newDiv);
    }
    return true;
  }

  resultTree.innerText = 'Entrada inválida'
  return false;
};

addRuleButton.addEventListener("click", (e) => {
  e.preventDefault();
  list.appendChild(renderListComponent());
});

// If the sessionStorage contains rules, load them
if (sessionStorage.getItem('generatedRules')) {
  const rules = JSON.parse(sessionStorage.getItem('generatedRules'));
  for (const rule of rules) {
    const [lhs, rhs] = rule.split(' -> ');
    const rhsWithoutSpacesOrLambdas = rhs
      .split(' ')
      .join('')
      .replace('λ', '');
    const newRule = renderListComponent();
    newRule.children[0].value = lhs;
    newRule.children[2].value = rhsWithoutSpacesOrLambdas;
    list.appendChild(newRule); 
  }
  validateAllRules();
}