function createGlowStyle() {
  const styleElementId = 'code-glow-style';
  const style =
    document.getElementById(styleElementId) || document.createElement('style');
  style.id = styleElementId;

  // 获取编辑器中的各种标记颜色
  const computeGlow = (tokenClass) => {
    const tokensEl = document.querySelector('.vscode-tokens-styles');

    // 如果还没有找到 tokens 元素，不执行后续操作
    if (!tokensEl || !tokensEl.sheet) {
      return;
    }

    // 从样式表中获取颜色
    const color = Array.from(tokensEl.sheet.cssRules).find(
      (rule) => rule.selectorText === `.${tokenClass}`,
    )?.style.color;

    // 如果没有颜色值则返回空字符串
    if (!color) {
      return 'none';
    }

    // 解析RGB值
    const rgb = color.match(/\d+/g);

    if (!rgb) {
      return 'none';
    }

    // 计算阴影效果
    return `
        0 0 2px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2),
        0 0 4px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3),
        0 0 8px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2),
        0 0 12px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)
    `;
  };

  // 监听主题变化
  const observer = new MutationObserver(() => {
    const tokens = ['mtk6', 'mtk10', 'mtk7', 'mtk9', 'mtk8', 'mtk14'];

    let css = '';
    tokens.forEach((token) => {
      const glow = computeGlow(token);
      css += `.${token} {
        text-shadow: ${glow};
      }
    `;
    });

    style.textContent = css;
  });

  // 修改观察目标为 head 元素
  observer.observe(document.head, {
    subtree: true, // 观察子树
    childList: true, // 观察子元素的添加或删除
    attributes: false, // 不需要观察属性变化
  });

  return style;
}

export function getInjectedScript() {
  return `
  (function() {
    document.head.appendChild((${createGlowStyle.toString()})());
  })();
`;
}
