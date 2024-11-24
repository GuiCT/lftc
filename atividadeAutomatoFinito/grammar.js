if (sessionStorage.getItem("grammarToAutomata")) {
  const grammar = JSON.parse(sessionStorage.getItem("grammarToAutomata"));
  console.log(grammar);

  // sessionStorage.removeItem("grammarToAutomata");
  // const automata = grammarToAutomata(grammar);
  // console.log(automata);
  const automata = grammarToAutomata(grammar);
  console.log(automata);
}
