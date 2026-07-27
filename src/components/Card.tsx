import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  imgSrc?: string;
  href?: string;
  asciiArt?: string;
  filename?: string;
  children?: ReactNode;
  className?: string;
}

export function Card({
  title,
  description,
  imgSrc,
  href,
  asciiArt,
  filename,
  children,
  className = '',
  ...props
}: CardProps) {
  if (!title && children) {
    return (
      <div
        className={`bg-zinc-900 border-2 border-white transition-all duration-200 hover:border-brutalist-cyan hover:shadow-hard-cyan group p-6 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }

  const computedFilename = filename || (title ? `${title.toLowerCase().replace(/\s+/g, '_')}.md` : 'card.md');

  return (
    <div className={`p-4 md:w-1/2 style-card-wrap ${className}`.trim()} style={{ maxWidth: '544px' }} {...props}>
      <div className="h-full bg-zinc-900 border-2 border-white transition-all duration-200 hover:border-brutalist-cyan hover:shadow-hard-cyan group">
        <div className="border-b-2 border-white px-4 py-2 flex justify-between items-center bg-black">
          <span className="font-mono text-sm text-brutalist-yellow font-bold uppercase">
            {computedFilename}
          </span>
          {asciiArt && (
            <pre className="text-xs text-brutalist-cyan leading-none">
              {asciiArt}
            </pre>
          )}
        </div>

        {imgSrc && (
          <div className="border-b-2 border-white">
            {href ? (
              <a href={href} aria-label={`Link to ${title || 'card'}`}>
                <img
                  alt={title || 'Card Image'}
                  src={imgSrc}
                  className="object-cover object-center lg:h-48 md:h-36 w-full"
                />
              </a>
            ) : (
              <img
                alt={title || 'Card Image'}
                src={imgSrc}
                className="object-cover object-center lg:h-48 md:h-36 w-full"
              />
            )}
          </div>
        )}

        <div className="p-6">
          {title && (
            <h2 className="mb-3 text-2xl font-display font-bold leading-8 tracking-tight uppercase text-white">
              {href ? (
                <a
                  href={href}
                  className="hover:text-brutalist-cyan transition-colors"
                  aria-label={`Link to ${title}`}
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </h2>
          )}
          {description && (
            <p className="prose mb-3 max-w-none text-zinc-400 font-sans">
              {description}
            </p>
          )}
          {children}
          {href && (
            <a
              href={href}
              className="text-base font-mono font-bold leading-6 text-brutalist-cyan hover:text-brutalist-pink group-hover:translate-x-1 inline-block transition-transform uppercase"
              aria-label={`Link to ${title || 'details'}`}
            >
              [ Learn More &rarr; ]
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
