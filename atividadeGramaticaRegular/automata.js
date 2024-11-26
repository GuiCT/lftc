/** @import {*} from 'grammar'*/

function generateAutomata() {
  const currentHref = window.location.href;
  window.sessionStorage.setItem(
    "grammarToAutomata",
    JSON.stringify(getGrammar())
  );
  console.log(getGrammar());
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeAutomatoFinito/index.html";
  window.location.href = newPath;
}

if (sessionStorage.getItem("automataToGrammar")) {
  const automata = JSON.parse(sessionStorage.getItem("automataToGrammar"));

  automata.transitions.forEach((element) => {
    const listcomponent = renderListComponent();
    listcomponent.children[0].value = `${element.origin}`;
    listcomponent.children[2].value = `${element.symbol}${element.target}`;
    list.appendChild(listcomponent);
  });
  automata.finalStates.forEach((element) => {
    const listcomponent = renderListComponent();
    listcomponent.children[0].value = `${element}`;
    list.appendChild(listcomponent);
  });
  console.log(automata);

  sessionStorage.removeItem("automataToGrammar");
}
