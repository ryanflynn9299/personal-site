import fs from "fs";
import path from "path";
import type { PolicyMetadata, PolicyDocument } from "@/types/policies";

/**
 * Parses frontmatter from a markdown file
 * Frontmatter format:
 * ---
 * key: value
 * ---
 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = match[1];
  const body = match[2];

  const frontmatter: Record<string, string> = {};
  const lines = frontmatterText.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line
      .substring(colonIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/**
 * Loads a policy document from a markdown file
 * @param filename - The name of the markdown file (e.g., "privacy-policy.md")
 * @returns Policy document with metadata and content
 */
export function loadPolicyDocument(filename: string): PolicyDocument {
  const filePath = path.join(process.cwd(), "data", "policies", filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Policy document not found: ${filename}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(fileContent);

  const metadata: PolicyMetadata = {
    title: frontmatter.title || "Policy Document",
    lastUpdated:
      frontmatter.lastUpdated || new Date().toISOString().split("T")[0],
  };

  return {
    metadata,
    content: body.trim(),
  };
}

/**
 * Gets a list of all available policy documents
 * @returns Array of policy filenames (without .md extension)
 */
export function getAvailablePolicies(): string[] {
  const policiesDir = path.join(process.cwd(), "data", "policies");

  if (!fs.existsSync(policiesDir)) {
    return [];
  }

  const files = fs.readdirSync(policiesDir);
  return files
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => file.replace(".md", ""));
}

/**
 * Loads all policy documents
 * @returns Array of policy documents with id, name, metadata, and content
 */
export function loadAllPolicies(): Array<{
  id: string;
  name: string;
  metadata: PolicyMetadata;
  content: string;
}> {
  const policyIds = getAvailablePolicies();

  return policyIds.map((id) => {
    const document = loadPolicyDocument(`${id}.md`);
    // Convert filename to display name (e.g., "privacy-policy" -> "Privacy Policy")
    const name = id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      id,
      name,
      metadata: document.metadata,
      content: document.content,
    };
  });
}
