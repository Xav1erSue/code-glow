function main() {
  const styleElementId = 'code-glow-style';
  const vscodeTokensStylesClassName = '.vscode-tokens-styles';

  let styleElement = document.getElementById(styleElementId);
  // create a style element to hold the glow styles if it doesn't exist
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  // the style element that contains the token colors, based on the current theme
  let tokensEl = document.querySelector(vscodeTokensStylesClassName);
  // the token class names to apply the glow effect to
  const tokens = ['mtk6', 'mtk10', 'mtk7', 'mtk9', 'mtk8', 'mtk14'];

  // generate glow style based on the token colors
  const updateGlowStyle = () => {
    styleElement.textContent = tokens.reduce((textContent, token) => {
      const color = Array.from(tokensEl.sheet.cssRules).find(
        (rule) => rule.selectorText === `.${token}`,
      )?.style?.color;

      if (!color) return textContent;

      const rgb = color.match(/\d+/g);
      // using multiple layers of text-shadow to create a glow effect
      const textShadow = `
        0 0 2px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2),
        0 0 4px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3),
        0 0 8px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2),
        0 0 12px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)
      `;

      textContent += `.${token} { text-shadow: ${textShadow}; }\n`;
      return textContent;
    }, '');
  };

  let tokensObserver = null;
  // observe changes in the tokens styles to update the glow style
  function observeTokensEl() {
    if (tokensObserver) tokensObserver.disconnect();
    tokensObserver = new MutationObserver(updateGlowStyle);
    tokensObserver.observe(tokensEl, { subtree: true, childList: true });
    updateGlowStyle();
  }

  // needs to wait for the tokens styles to be loaded
  const headObserver = new MutationObserver(() => {
    tokensEl = document.querySelector(vscodeTokensStylesClassName);
    if (!tokensEl) return;
    headObserver.disconnect();
    // once the tokens styles are loaded, observe it for changes
    observeTokensEl();
  });

  // start observing the head for the tokens styles to be added
  headObserver.observe(document.head, { childList: true, subtree: true });
}

export function getInjectedScript() {
  return `(${main.toString()})();`;
}
