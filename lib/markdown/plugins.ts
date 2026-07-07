import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export const markdownRemarkPlugins = [remarkGfm];
export const markdownRehypePlugins = [rehypeRaw, rehypeSanitize];
