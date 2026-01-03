import mermaid from 'mermaid';

export function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    layout: 'LR',
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#8caaee',
      'primaryTextColor': '#A7D188',
      'primaryBorderColor': '#8caaee',
      'lineColor': '#737994',
      'secondaryColor': '#f2d5cf',
      'tertiaryColor': '#e5c890',
      'noteBkgColor': '#babbf1',
      'noteTextColor': '#303446',
      'noteBorderColor': '#babbf1',
      'mainBkg': '#303446',
      'nodeBorder': '#8caaee',
      'clusterBkg': '#414559',
      'clusterBorder': '#626880',
      'titleColor': '#c6d0f5',
      'edgeLabelBackground': '#414559',
      'fontFamily': 'JetBrains Mono, Fira Code, monospace'
    }
  });

  const renderMermaid = async () => {
    const diagrams = document.querySelectorAll<HTMLElement>('pre[data-language="mermaid"]');

    for (const diagram of diagrams) {
      const code = diagram.textContent || '';
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

      try {
        const { svg } = await mermaid.render(id, code);
        const container = document.createElement('div');
        container.className = 'mermaid-diagram';
        container.innerHTML = svg;
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.backgroundColor = '#2C3041';
        container.style.borderRadius = '8px';
        diagram.replaceWith(container);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
}
