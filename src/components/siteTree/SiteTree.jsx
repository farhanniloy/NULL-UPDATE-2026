"use client";
import React, { useState } from 'react';
import styles from './siteTree.module.css';
import Link from 'next/link';

const Toggle = ({ open }) => <span className={styles.toggleIcon}>{open ? '▾' : '▸'}</span>;

function TreeNode({ node, level = 0, highlightSlug }) {
  // Keep everything expanded by default per request
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isCurrent = node.slug === highlightSlug;

  // click handler for /root: checks auth and redirects appropriately
  const handleRootClick = async (e) => {
    e?.preventDefault?.();
    try {
      const res = await fetch('/api/root-check');
      if (res && res.ok) {
        const j = await res.json().catch(() => null);
        if (j && j.allowed && j.redirect) {
          window.location.href = j.redirect;
          return;
        }
      }
      window.location.href = '/restricted';
    } catch (err) {
      console.error('root-check failed', err);
      window.location.href = '/restricted';
    }
  };

  return (
    <div className={styles.node} style={{ paddingLeft: level * 12 }}>
      <div className={`${styles.row} ${isCurrent ? styles.current : ''}`}>
        {hasChildren ? (
          <button aria-label={open ? 'Collapse' : 'Expand'} onClick={() => setOpen(!open)} className={styles.toggleButton}>
            <Toggle open={open} />
          </button>
        ) : (
          <span className={styles.empty} />
        )}

        {/* render root as an interactive control that routes based on auth */}
        {node.name === '/root' ? (
          <button onClick={handleRootClick} className={styles.rootLink} aria-label="root">{node.name}</button>
        ) : node.url ? (
          <Link href={node.url} className={styles.link}>
            {node.name}
          </Link>
        ) : (
          <span className={styles.text}>{node.name}</span>
        )}
      </div>

      {hasChildren && open && (
        <div className={styles.children}>
          {(() => {
            try {
              return node.children.map((c, i) => (
                <TreeNode key={(c.slug || c.name) + '-' + i} node={c} level={level + 1} highlightSlug={highlightSlug} />
              ));
            } catch (e) {
              console.error('Error rendering tree children', e);
              return <div className={styles.error}>Error loading tree</div>;
            }
          })()}
        </div>
      )}
    </div>
  );
}

export default function SiteTree({ treeData, highlightSlug }) {
  // defensive: if treeData is missing or malformed, render a safe fallback and log details
  if (!treeData || typeof treeData !== 'object') {
    console.warn('SiteTree: missing or invalid treeData', treeData);
    return (
      <div className={styles.wrapper} aria-label="site-tree">
        <div className={styles.header}>tree</div>
        <div className={styles.tree}>
          <div className={styles.error}>Tree data unavailable</div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className={styles.wrapper} aria-label="site-tree">
      <div className={styles.tree}>
        <TreeNode node={treeData} level={0} highlightSlug={highlightSlug} />
      </div>
    </div>
  );
  } catch (e) {
    // Catch unexpected runtime render errors and show a safe fallback
    console.error('SiteTree render error', e, { treeData, highlightSlug });
    return (
      <div className={styles.wrapper} aria-label="site-tree">
        <div className={styles.header}>tree</div>
        <div className={styles.tree}>
          <div className={styles.error}>Error rendering tree</div>
        </div>
      </div>
    );
  }
}
