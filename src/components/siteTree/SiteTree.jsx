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

  // special handler for the root (/root) node: call server to decide redirect or restricted
  const handleRootClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/root-check');
      if (res.status === 200) {
        const j = await res.json();
        if (j.allowed && j.redirect) {
          window.location.href = j.redirect;
          return;
        }
      }
      // otherwise navigate to a restricted page that returns 503
      window.location.href = '/restricted';
    } catch (err) {
      console.error('root click failed', err);
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

        {/* special-case the root node so clicking it triggers the server-check */}
        {node.name === '/root' ? (
          <button onClick={handleRootClick} className={styles.link}>
            {node.name}
          </button>
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
  const handleRootClickTop = async (e) => {
    e?.preventDefault?.();
    try {
      const res = await fetch('/api/root-check');
      if (res.status === 200) {
        const j = await res.json();
        if (j.allowed && j.redirect) {
          window.location.href = j.redirect;
          return;
        }
      }
      window.location.href = '/restricted';
    } catch (err) {
      console.error('root click failed', err);
      window.location.href = '/restricted';
    }
  };

  return (
    <div className={styles.wrapper} aria-label="site-tree">
      <div className={styles.header}>Tree</div>
      <div className={styles.rootBox}>
        <button onClick={handleRootClickTop} className={styles.rootButton}>{'/root'}</button>
      </div>
      <div className={styles.tree}>
        <TreeNode node={treeData} level={0} highlightSlug={highlightSlug} />
      </div>
    </div>
  );
}
