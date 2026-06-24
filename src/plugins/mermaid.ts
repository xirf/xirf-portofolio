import mermaid from 'mermaid';

export function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
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
    console.log(`[Mermaid] Found ${diagrams.length} diagrams`);

    if (diagrams.length === 0) return;

    // Ensure mermaid is loaded
    if (!mermaid || typeof mermaid.render !== 'function') {
      console.error('[Mermaid] Mermaid not properly loaded');
      return;
    }

    for (const diagram of diagrams) {
      const code = (diagram.textContent || '').trim();
      const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

      if (!code) continue;

      try {
        console.log('[Mermaid] Rendering diagram:', id, code.substring(0, 50));
        const result = await mermaid.render(id, code);
        const svg = typeof result === 'string' ? result : result.svg;

        if (!svg) {
          console.error('[Mermaid] No SVG returned for diagram:', id);
          continue;
        }

        const container = document.createElement('div');
        container.className = 'mermaid-diagram';
        container.innerHTML = svg;
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.backgroundColor = '#2C3041';
        container.style.borderRadius = '8px';
        diagram.replaceWith(container);
        console.log('[Mermaid] Successfully rendered:', id);
      } catch (error) {
        console.error('Mermaid rendering error for diagram', id, ':', error);
      }
    }
  };

  // Run on page load or when DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
}
