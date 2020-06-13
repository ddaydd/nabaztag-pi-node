/* exemple file.html

  <div id="react-div">
    {reactVar} {reactVar2}
  </div>

  <script type="module">
    import {obReact} from './ob-react.mjs';
    obReactData = obReact.setReactData('#react-div');
    obReactData['reactVar'] = 'Hello';
    obReactData['reactVar2'] = 'World';
  </script>

*/

const obReact = {
  node: "",
  getTplVar: function(el) {
    this.node = document.querySelector(el);
    const keys = this.node.innerHTML.match(/\{([^}]+)\}/g);
    const blob = {};
    for(let i = 0; i < keys.length; i++) {
      const str = keys[i];
      keys[i] = str.substring(1, str.length - 1);
      blob[keys[i]] = "";
    }
    return blob;
  },
  setReactData: function(el) {
    const blob = this.getTplVar(el);
    const data = new Proxy(blob, {
      set: (target, property, value) => {
        target[property] = value;
        this.node.render(blob);
        return true;
      },
    });
    this.node.template = this.node.innerHTML;
    this.node.render = function render(data) {
      this.innerHTML = this.template.replace(/\{\s?(\w+)\s?\}/g, (match, variable) => {
        return data[variable] || '';
      });
    };
    return data;
  },
};

export {obReact};