import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Menu } from "./Menu";
import Footer from "./Footer";

interface PostData {
  content: string;
  title: string;
  date: Date;
  tags: string[];
  path: string;
}

interface PostFrontmatter {
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string;
}

export const Post = () => {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const parseFrontmatter = (
    content: string
  ): { frontmatter: PostFrontmatter; body: string } => {
    const normalizedContent = content.replace(/\r\n/g, "\n").trim();

    if (!normalizedContent.startsWith("---\n")) {
      return { frontmatter: {}, body: content };
    }

    const lines = normalizedContent.split("\n");
    let endIndex = -1;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      return { frontmatter: {}, body: content };
    }

    const frontmatterLines = lines.slice(1, endIndex);
    const bodyLines = lines.slice(endIndex + 1);
    const frontmatter: PostFrontmatter = {};

    frontmatterLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const colonIndex = trimmedLine.indexOf(":");
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (
          key === "title" ||
          key === "date" ||
          key === "excerpt" ||
          key === "tags"
        ) {
          frontmatter[key as keyof PostFrontmatter] = value;
        }
      }
    });

    return {
      frontmatter,
      body: bodyLines.join("\n").trim(),
    };
  };

  const parseTags = (tagsString?: string): string[] => {
    if (!tagsString) return [];

    return tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Navigate to blog with filters - matches Blog component functionality
  const handleDirectoryChange = (directory: string) => {
    navigate(`/blog?dir=${directory}`);
  };

  const handleTagChange = (tag: string) => {
    navigate(`/blog?tag=${tag}`);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the path from URL (everything after /blog/)
        const postPath = location.pathname.replace("/blog/", "");

        if (!postPath) {
          navigate("/blog");
          return;
        }

        // Load all markdown files to find the matching post
        const postModules = import.meta.glob("../posts/**/*.md", {
          eager: true,
          as: "raw",
        });

        let foundPost: PostData | null = null;

        // Search through all posts to find the matching one
        for (const [filePath, content] of Object.entries(postModules)) {
          // Extract the relative path (this is the full path including directories)
          const relativePath = filePath
            .replace("../posts/", "")
            .replace(".md", "");

          // Only match by the full relative path (not filename)
          if (relativePath === postPath) {
            const { frontmatter, body } = parseFrontmatter(content as string);
            const filename =
              filePath.split("/").pop()?.replace(".md", "") || "";

            foundPost = {
              content: body,
              title: frontmatter.title || filename,
              date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
              tags: parseTags(frontmatter.tags),
              path: relativePath,
            };
            break;
          }
        }

        if (!foundPost) {
          setError("Post not found");
        } else {
          setPost(foundPost);
        }
      } catch (err) {
        setError("Failed to load post");
        console.error("Error loading post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-8">
        <div className="max-w-none window min-w-0 w-full">
          <div className="title-bar">
            <div className="title-bar-text">Exploring - (/blog/...)</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <Menu selected="blog" />
          <div className="window" role="tabpanel">
            <div className="window-body main p-4">
              <div className="prose max-w-none overflow-hidden">
                <p>Loading post...</p>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full px-4 sm:px-8">
        <div className="max-w-none window min-w-0 w-full">
          <div className="title-bar">
            <div className="title-bar-text">Exploring - (/blog/404)</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <Menu selected="blog" />
          <div className="window" role="tabpanel">
            <div className="window-body main p-4">
              <div className="prose max-w-none overflow-hidden">
                <h1>Post Not Found</h1>
                <p>{error || "The requested post could not be found."}</p>
                <a href="/blog" className="text-blue-600 hover:text-blue-800">
                  ← Back to Blog
                </a>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8">
      <div className="max-w-none window min-w-0 w-full">
        <div className="title-bar">
          <div className="title-bar-text">Exploring - (/blog/{post.path})</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
          </div>
        </div>
        <Menu selected="blog" />
        <div className="window" role="tabpanel">
          <div className="window-body main p-4">
            <div className="prose max-w-none overflow-hidden">
              <article className="post">
                <header className="mb-6">
                  <h1 className="font-bold mb-4">{post.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <time
                      className="text-gray-600 text-sm"
                      dateTime={post.date.toISOString()}
                    >
                      {formatDate(post.date)}
                    </time>
                    {/* Show the directory path as a clickable category - matches Blog component */}
                    {post.path.includes("/") && (
                      <button
                        onClick={() =>
                          handleDirectoryChange(
                            post.path.split("/").slice(0, -1).join("/")
                          )
                        }
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        {post.path.split("/").slice(0, -1).join("/")}
                      </button>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex gap-2">
                        {post.tags.map((tag, tagIndex) => (
                          <button
                            key={tagIndex}
                            onClick={() => handleTagChange(tag)}
                            className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <a
                    href="/blog"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Blog
                  </a>
                </header>

                <div className="post-content">
                  <div className="break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Enhanced code block with syntax highlighting
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        any) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const language = match ? match[1] : "";

                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={language}
                              PreTag="div"
                              className="not-prose"
                              customStyle={{
                                margin: "1rem 0",
                                fontSize: "0.875rem",
                                fontFamily: "Consolas, monospace",
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="monospace bg-gray-100 px-1 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        // Simply don't render pre elements - let SyntaxHighlighter handle everything
                        pre: ({ children }) => <>{children}</>,
                        // Ensure images are responsive
                        img: ({ src, alt, ...props }) => (
                          <img
                            src={src}
                            alt={alt}
                            className="max-w-full h-auto rounded"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
