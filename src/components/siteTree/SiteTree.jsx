"use client";
import React, { useState } from 'react';
import styles from './siteTree.module.css';
import Link from 'next/link';

const Toggle = ({ open }) => <span className={styles.toggleIcon}>{open ? '▾' : '▸'}</span>;

function TreeNode({ node, level = 0, highlightSlug }) {
  const [open, setOpen] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isCurrent = node.slug === highlightSlug;

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

        {node.url ? (
          <Link href={node.url} className={styles.link}>
            {node.name}
          </Link>
        ) : (
          <span className={styles.text}>{node.name}</span>
        )}
      </div>

      {hasChildren && open && (
        <div className={styles.children}>
          {node.children.map((c, i) => (
            <TreeNode key={(c.slug || c.name) + '-' + i} node={c} level={level + 1} highlightSlug={highlightSlug} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteTree({ treeData, highlightSlug }) {
  return (
    <div className={styles.wrapper} aria-label="site-tree">
      <div className={styles.header}>Tree</div>
      <div className={styles.tree}>
        <TreeNode node={treeData} level={0} highlightSlug={highlightSlug} />
      </div>
    </div>
  );
}
