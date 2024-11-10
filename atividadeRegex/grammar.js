function generateGrammarFromRegex(regex) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ""; // Clear previous results

  // Ensure regex is not empty
  if (!regex) {
    resultDiv.innerHTML =
      '<span class="error">Please enter a valid regular expression.</span>';
    return;
  }

  const grammar = [];
  let stateCounter = 0;
  const startState = "S";
  let currentState = startState;
  let stack = [];
  let lastCharWasStar = false;

  if (regex.startsWith("^") && regex.endsWith("$")) {
    regex = regex.replace(/^(\^)?(.*?)(\$)?$/, "$2");
    for (let i = 0; i < regex.length; i++) {
      const char = regex[i];

      if (char === "(") {
        // Start a new branch, push current state to stack
        stack.push(currentState);
      } else if (char === ")") {
        // End of group, pop the state stack
        currentState = stack.pop();
      } else if (char === "|") {
        // Start a new alternative from the last saved state in the group
        currentState = stack[stack.length - 1];
      } else if (char === "*") {
        // Apply Kleene star: loop back to current state's start
        grammar.push(`${currentState} -> ${regex[i - 1]} ${currentState}`);
        lastCharWasStar = true;
      } else {
        // For regular characters, create a new transition and state
        const nextState = `S${++stateCounter}`;

        // Handle alternation or new branch, skipping if last char was '*'
        if (!lastCharWasStar) {
          grammar.push(`${currentState} -> ${char} ${nextState}`);
        }
        currentState = nextState;
        lastCharWasStar = false;
      }
    }

    // Final state transition to λ
    grammar.push(`${currentState} -> λ`);

    // Display generated grammar
    resultDiv.innerHTML = "<h3>Generated Grammar:</h3>";
    grammar.forEach((rule) => {
      const ruleElement = document.createElement("p");
      ruleElement.innerText = rule;
      resultDiv.appendChild(ruleElement);
    });
  } else {
    resultDiv.innerHTML =
      '<span class="error">Please enter a valid regular expression.</span>';
  }
}

document.getElementById("generateGrammar").addEventListener("click", () => {
  const regexInput = document.getElementById("input_regex").value;
  generateGrammarFromRegex(regexInput);
});
