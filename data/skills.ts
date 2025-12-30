import { Code, Database, Cloud, PenTool, Bot } from "lucide-react";

export const techCategories = [
  {
    category: "Languages",
    icon: Code,
    className: "md:col-span-1 md:row-span-2", // classname is used to control the grid layout
    skills: [
      {
        name: "Python",
        description: "Rapid development, data science, and automation.",
      },
      {
        name: "Java",
        description: "Enterprise-grade applications and Android development.",
      },
      {
        name: "Spring",
        description:
          "Robust framework for building Java web applications and APIs.",
      },
      {
        name: "SQL",
        description:
          "Ubiquitous data-querying language for relational databases.",
      },
      {
        name: "Go",
        description: "High-performance concurrent systems and APIs.",
      },
      {
        name: "Kotlin",
        description: "Modern Android development with concise syntax.",
      },
      {
        name: "TypeScript",
        description: "Robust, scalable, and type-safe web applications.",
      },
    ],
  },
  {
    category: "Databases & Caching",
    icon: Database,
    className: "md:col-span-2",
    skills: [
      {
        name: "PostgreSQL",
        description: "Reliable, feature-rich relational data storage.",
      },
      {
        name: "MongoDB",
        description: "Flexible, scalable NoSQL document databases.",
      },
      {
        name: "MySQL",
        description: "Widely used relational database for web applications.",
      },
      {
        name: "Redis",
        description: "High-speed in-memory caching and message brokering.",
      },
    ],
  },
  {
    category: "Cloud & DevOps",
    icon: Cloud,
    className: "md:col-span-1", // Standard block
    skills: [
      {
        name: "Docker",
        description: "Containerization for consistent deployments.",
      },
      {
        name: "Google Cloud",
        description: "Leveraging cloud services for scalable infrastructure.",
      },
      {
        name: "Nginx",
        description: "High-performance web serving and proxying.",
      },
      {
        name: "Kubernetes",
        description: "Orchestrating containerized applications at scale.",
      },
    ],
  },
  {
    category: "AI & ML",
    icon: Bot,
    className: "md:col-span-1",
    skills: [
      {
        name: "Scikit Learn",
        description: "Training machine learning pipelines.",
      },
      {
        name: "PyTorch",
        description: "Developing custom deep learning models.",
      },
      {
        name: "n8n",
        description: "Automating AI agent workflows with no-code solutions.",
      },
    ],
  },
  {
    category: "Frontend & UI",
    icon: PenTool,
    className: "md:col-span-2",
    skills: [
      {
        name: "React",
        description: "Building modern, component-based user interfaces.",
      },
      {
        name: "HTML & CSS",
        description:
          "Leveraging the basics to create beautiful web interfaces.",
      },
      {
        name: "Tailwind CSS",
        description: "Rapidly building custom designs with utility classes.",
      },
      {
        name: "Next.js",
        description:
          "Server-side rendering and static site generation for React.",
      },
      {
        name: "Framer Motion",
        description: "Creating fluid, production-ready animations.",
      },
    ],
  },
];
