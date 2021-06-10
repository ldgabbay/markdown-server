document.addEventListener('DOMContentLoaded', function() {
  for (const converter of ['texmath', 'puml']) {
    let nodes = document.getElementsByClassName(`language-${converter}`);
    // prism.js adds the classname to the <pre> parent element too, which breaks this.  so load this script first.
    for (let node of nodes) {
      let img = document.createElement('img');
      img.src = `_/${converter}/${encodeURIComponent(node.innerText.replace(/^\s+|\s+$/g, ''))}`;
      img.classList.add(converter);
      let div = document.createElement('div');
      div.appendChild(img);
      let parent = node.parentElement;
      parent.parentElement.replaceChild(div, parent);
    }
  }
});