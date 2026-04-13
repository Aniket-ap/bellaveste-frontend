import React from 'react';
import { Link } from 'react-router-dom';

export const CategoryGrid = ({ categories }) => {
  const count = Array.isArray(categories) ? categories.length : 0;
  const gridClass =
    count <= 3 ? 'grid grid-cols-1 sm:grid-cols-3 gap-6' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4';
  const cardAspect = count <= 3 ? 'aspect-[16/10]' : 'aspect-[3/4]';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between gap-6 mb-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--bv-text)]">
          SHOP BY CATEGORY
        </h2>
        <div className="hidden sm:block text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
          Explore
        </div>
      </div>
      <div className={gridClass}>
        {categories.map(category => (
          <Link 
            key={category._id} 
            to={`/category/${category.slug || category._id}`}
            className={`group relative rounded-[2rem] overflow-hidden ${cardAspect} cursor-pointer border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] hover:border-[color:var(--bv-border-strong)] transition-colors block`}
          >
            <img 
              src={category.image ? category.image.replace(/`/g, '').trim() : ''} 
              alt={category.name} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
            <div className="absolute left-4 bottom-4 right-4">
              <h3 className="text-white font-bold text-lg tracking-tight leading-tight">{category.name}</h3>
              <div className="mt-1 text-xs tracking-[0.22em] uppercase text-white/70">View</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
