function generateAutomata() {
    const currentHref = window.location.href;
    window.sessionStorage.setItem(
      "grammarToAutomata",
      JSON.stringify(getGrammar())
    );
    let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
    newPath = newPath.substring(0, newPath.lastIndexOf("/"));
    newPath += "/atividadeAutomatoFinito/index.html";
    window.location.href = newPath;
  }
  