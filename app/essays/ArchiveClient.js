'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATS = ['All', 'Leadership', 'Growth', 'Innovation', 'Change', 'Faith', 'Ministry', 'Oddities'];
const MO = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function ArchiveClient({ posts }) {
  const [filter, setFilter] = useState('All');
  const shown = posts.filter((p) => filter === 'All' || p.categories.includes(filter));

  const byYear = {};
  for (const p of shown) {
    const [y, m, d] = p.date.split('-');
    (byYear[y] = byYear[y] || []).push({
      slug: p.slug,
      title: p.title,
      dateShort: `${MO[+m - 1]} ${+d}`,
      catLine: p.categories.join(' · ').toUpperCase(),
    });
  }
  const years = Object.keys(byYear)
    .sort((a, b) => b - a)
    .map((y) => ({ year: y, items: byYear[y] }));

  const allYears = posts.map((p) => p.date.slice(0, 4));
  const range = allYears.length ? `${Math.min(...allYears)} — ${Math.max(...allYears)}` : '';

  return (
    <>
      <div className="essays-head">
        <div>
          <h1 className="essays-h1">The Essays</h1>
          <div className="essays-count">
            {range} · {shown.length} ENTRIES
          </div>
        </div>
        <div className="filter-row">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${c === filter ? ' active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="essays-list">
        {years.map((y) => (
          <div className="year-block" key={y.year}>
            <div className="year-head">
              <span className="year-label">{y.year}</span>
            </div>
            {y.items.map((p) => (
              <Link href={`/blog/${p.slug}`} className="essay-row" key={p.slug}>
                <span className="essay-row-date">{p.dateShort}</span>
                <span className="essay-row-title">{p.title}</span>
                <span className="essay-row-cats">{p.catLine}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
