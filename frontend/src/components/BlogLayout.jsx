import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './BlogLayout.css';

export default function BlogLayout({ story }) {
    const titleRef = useScrollAnimation({ y: 40, duration: 0.8 });

    return (
        <article className="blog-layout">
            {/* Cover Image */}
            <div className="blog-layout__cover">
                <img src={story.coverImage} alt={story.title} className="blog-layout__cover-image" loading="lazy" />
                <div className="blog-layout__cover-overlay" />
            </div>

            {/* Article Header */}
            <header className="blog-layout__header container--narrow" ref={titleRef}>
                <span className="eyebrow">{story.category}</span>
                <h1 className="blog-layout__title">{story.title}</h1>
                <p className="blog-layout__subtitle">{story.subtitle}</p>
                <div className="blog-layout__meta">
                    <span>{story.author}</span>
                    <span className="blog-layout__dot">·</span>
                    <span>{story.date}</span>
                    <span className="blog-layout__dot">·</span>
                    <span>{story.readTime}</span>
                </div>
            </header>

            {/* Article Body */}
            <div className="blog-layout__body container--narrow">
                {story.content.map((block, index) => {
                    if (block.type === 'paragraph') {
                        return (
                            <p key={index} className={block.dropcap ? 'drop-cap' : ''}>
                                {block.text}
                            </p>
                        );
                    }

                    if (block.type === 'image') {
                        return (
                            <figure key={index} className="blog-layout__figure">
                                <img src={block.src} alt={block.caption} loading="lazy" />
                                {block.caption && (
                                    <figcaption className="blog-layout__caption">{block.caption}</figcaption>
                                )}
                            </figure>
                        );
                    }

                    if (block.type === 'quote') {
                        return (
                            <blockquote key={index} className="blog-layout__quote">
                                <p>"{block.text}"</p>
                                {block.attribution && (
                                    <cite>— {block.attribution}</cite>
                                )}
                            </blockquote>
                        );
                    }

                    return null;
                })}
            </div>
        </article>
    );
}
