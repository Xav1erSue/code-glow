// @ts-nocheck

function createGlowStyle() {
  const style = document.createElement('style');

  // 获取编辑器中的各种标记颜色
  const computeGlow = (element) => {
    const color = window.getComputedStyle(element).color;
    const rgb = color.match(/\d+/g);
    if (!rgb) {
      return '';
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
    const tokens = document.querySelectorAll(
      '.mtk6, .mtk10, .mtk7, .mtk9, .mtk8, .mtk14',
    );

    let css = '';
    tokens.forEach((token) => {
      const className = Array.from(token.classList).find((c) =>
        c.startsWith('mtk'),
      );
      if (className) {
        const glow = computeGlow(token);
        css += `
                  .${className} {
                      text-shadow: ${glow};
                      font-weight: 500;  // 略微加粗
                      color: brightness(1.1);  // 增加颜色亮度
                  }
              `;
      }
    });

    style.textContent = css;
  });

  // 开始观察 DOM 变化
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
  });

  return style;
}

export function getInjectedScript() {
  return `
(function() {
  ${createGlowStyle.toString()}
  document.head.appendChild(createGlowStyle());
})();
`;
}
