import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "./Menu";
import { blog } from "./ascii";
import Footer from "./Footer";

interface Post {
  content: string;
  path: string;
  title: string;
  date: Date;
  excerpt: string;
  slug: string;
  tags: string[];
}

interface PostFrontmatter {
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string;
}

export const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDirectory, setSelectedDirectory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [availableDirectories, setAvailableDirectories] = useState<string[]>(
    []
  );
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  const parseFrontmatter = (
    content: string
  ): { frontmatter: PostFrontmatter; body: string } => {
    // Handle different line endings and whitespace
    const normalizedContent = content.replace(/\r\n/g, "\n").trim();

    // Check if content starts with frontmatter
    if (!normalizedContent.startsWith("---\n")) {
      return { frontmatter: {}, body: content };
    }

    // Find the closing --- (must be on its own line)
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

    // Parse frontmatter lines
    frontmatterLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return; // Skip empty lines and comments

      const colonIndex = trimmedLine.indexOf(":");
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();

        // Remove quotes if present
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

  const generateExcerpt = (
    content: string,
    maxLength: number = 200
  ): string => {
    // Remove markdown formatting for excerpt
    const plainText = content
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    return plainText.length > maxLength
      ? plainText.substring(0, maxLength).trim() + "..."
      : plainText;
  };

  // Parse URL parameters for filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dirFilter = params.get("dir") || "all";
    const tagFilter = params.get("tag") || "all";

    setSelectedDirectory(dirFilter);
    setSelectedTag(tagFilter);
  }, [location.search]);

  // Update URL when filters change
  const updateURL = (directory: string, tag: string) => {
    const params = new URLSearchParams();
    if (directory !== "all") params.set("dir", directory);
    if (tag !== "all") params.set("tag", tag);

    const search = params.toString();
    navigate(`/blog${search ? `?${search}` : ""}`, { replace: true });
  };

  // Filter posts based on selected directory and tag
  useEffect(() => {
    let filtered = [...posts];

    if (selectedDirectory !== "all") {
      filtered = filtered.filter((post) => {
        const postDir = post.path.includes("/")
          ? post.path.split("/").slice(0, -1).join("/")
          : "root";
        return postDir === selectedDirectory;
      });
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [posts, selectedDirectory, selectedTag]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postModules = import.meta.glob("../posts/**/*.md", {
        eager: true,
        as: "raw",
      });

      const posts = Object.entries(postModules).map(([path, content]) => {
        const { frontmatter, body } = parseFrontmatter(content as string);

        // Extract the full relative path (including directories) as the slug
        const relativePath = path.replace("../posts/", "").replace(".md", "");
        const filename =
          path.split("/").pop()?.replace(".md", "") || "untitled";

        return {
          content: body,
          path: relativePath, // Full path including directories
          title: frontmatter.title || filename,
          date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
          excerpt: frontmatter.excerpt || generateExcerpt(body),
          slug: relativePath, // Use full path as slug
          tags: parseTags(frontmatter.tags),
        };
      });

      // Sort posts by date (newest first)
      posts.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Extract unique directories
      const directories = [
        ...new Set(
          posts.map((post) => {
            if (post.path.includes("/")) {
              return post.path.split("/").slice(0, -1).join("/");
            }
            return "root";
          })
        ),
      ].sort();

      // Extract unique tags
      const tags = [...new Set(posts.flatMap((post) => post.tags))].sort();

      setPosts(posts);
      setAvailableDirectories(directories);
      setAvailableTags(tags);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDirectoryChange = (directory: string) => {
    setSelectedDirectory(directory);
    updateURL(directory, selectedTag);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    updateURL(selectedDirectory, tag);
  };

  const clearFilters = () => {
    setSelectedDirectory("all");
    setSelectedTag("all");
    updateURL("all", "all");
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-8">
        <div className="max-w-none window min-w-0 w-full">
          <div className="title-bar">
            <div className="title-bar-text">Exploring - (/blog)</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <Menu selected="blog" />
          <div className="window" role="tabpanel">
            <div className="window-body main p-4">
              {blog}
              <hr />
              <div className="prose max-w-none col-span-10 overflow-hidden">
                <p className="break-words">Loading...</p>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full px-4 sm:px-8">
        <div className="max-w-none window min-w-0 w-full">
          <div className="title-bar">
            <div className="title-bar-text">
              Exploring - (/blog
              {selectedDirectory !== "all" && `/${selectedDirectory}`}
              {selectedTag !== "all" && ` #${selectedTag}`})
            </div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <Menu selected="blog" />
          <div className="window" role="tabpanel">
            <div className="window-body main p-4">
              {blog}

              {/* Filter Controls */}
              <div className="window-body">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Directory:</label>
                    <select
                      value={selectedDirectory}
                      onChange={(e) => handleDirectoryChange(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All directories</option>
                      {availableDirectories.map((dir) => (
                        <option key={dir} value={dir}>
                          {dir === "root" ? "Root" : dir}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Tag:</label>
                    <select
                      value={selectedTag}
                      onChange={(e) => handleTagChange(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All tags</option>
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(selectedDirectory !== "all" || selectedTag !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filters
                    </button>
                  )}

                  <div className="text-sm text-gray-600">
                    Showing {filteredPosts.length} of {posts.length} posts
                  </div>
                </div>
              </div>

              <div className="prose prose-headings:mt-6 max-w-none col-span-10 overflow-hidden">
                <div className="space-y-8">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        No posts found matching the current filters.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear filters to see all posts
                      </button>
                    </div>
                  ) : (
                    filteredPosts.map((post, index) => (
                      <article
                        key={index}
                        className="post border-b border-gray-200 pb-8 last:border-b-0"
                      >
                        <header className="mb-4">
                          <h2 className="text-2xl font-semibold mb-2">
                            <a
                              href={`/blog/${post.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </a>
                          </h2>
                          <div className="flex items-center gap-4 mb-2">
                            <time
                              className="text-gray-600 text-sm"
                              dateTime={post.date.toISOString()}
                            >
                              {formatDate(post.date)}
                            </time>
                            {/* Show the directory path as a category */}
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
                        </header>

                        <div className="excerpt mb-4">
                          <p className="text-gray-700 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        <footer>
                          <a
                            href={`/blog/${post.slug}`}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Read more →
                          </a>
                        </footer>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }
};
