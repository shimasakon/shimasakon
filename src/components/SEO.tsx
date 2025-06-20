import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
}

export const SEO = ({
  title = "tlsbollei - Cybersecurity Researcher & CTF Player",
  description = "Cybersecurity research, CTF writeups, reverse engineering, and binary exploitation insights. Follow my journey through the world of information security.",
  image = "/tlsbollei.jpg",
  url = "https://tlsbollei.vercel.app",
  type = "website",
  publishedTime,
  modifiedTime,
  tags = [],
  author = "tlsbollei"
}: SEOProps) => {
  const siteUrl = "https://tlsbollei.vercel.app"; // Update with your actual domain
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const canonicalUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "BlogPosting" : "WebSite",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "image": fullImageUrl,
    ...(type === "article" && {
      "author": {
        "@type": "Person",
        "name": author,
        "email": "boleii466@gmail.com",
        "url": siteUrl
      },
      "publisher": {
        "@type": "Person",
        "name": "tlsbollei",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/tlsbollei.jpg`
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "keywords": tags.join(", "),
      "articleSection": "Technology",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    }),
    ...(type === "website" && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/blog?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    })
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="tlsbollei" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@tlsbollei" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Keywords */}
      {tags.length > 0 && (
        <meta name="keywords" content={tags.join(", ")} />
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="msapplication-TileColor" content="#1a1a1a" />
    </Helmet>
  );
};