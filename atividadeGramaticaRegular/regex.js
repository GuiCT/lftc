function generateRegex() {
    const parentElement = document.getElementById("list");
    let arrayRegex = [];
    for (const child of parentElement.children) {
      if (child.getElementsByTagName("input")[1].value === "") {
        arrayRegex.push(
          child.getElementsByTagName("input")[0].value + " -> " + "λ"
        );
      } else {
        arrayRegex.push(
          child.getElementsByTagName("input")[0].value +
            " -> " +
            child.getElementsByTagName("input")[1].value
        );
      }
  
      // console.log("Child using for...of:", child.getElementsByTagName("input")[1].value);
    }
    const currentHref = window.location.href;
    // // remove two last paths
    window.sessionStorage.setItem("grammarToRegex", JSON.stringify(arrayRegex));
    let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
    newPath = newPath.substring(0, newPath.lastIndexOf("/"));
    newPath += "/atividadeRegex/index.html";
    // // // newPath += "/atividadeGramaticaRegular/index.html";
    window.location.href = newPath;
  }
  