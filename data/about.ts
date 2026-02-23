// About page content and data

import { Code, BookOpen, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AboutPageData {
  title: string;
  description: string;
  sectionOne: {
    title: string;
    content: string;
    image: string;
  };
  sectionTwo: {
    title: string;
    content: string;
    image: string;
  };
  sectionThree: {
    title: string;
    content: string;
    image: string;
  };
  ctaSection: {
    vitae: {
      title: string;
      description: string;
      linkText: string;
      href: string;
    };
    contact: {
      title: string;
      description: string;
      linkText: string;
      href: string;
    };
  };
}

export interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const aboutPage: AboutPageData = {
  title: "About Me",
  description: "Learn more about my values, background and interests.",
  sectionOne: {
    title: "My Philosophy",
    content:
      "I believe in the power of technology to solve real-world problems. My approach " +
      "to software development is rooted in craftsmanship, continuous learning, and a deep " +
      "commitment to user-centric design. I strive to write code that is not only functional " +
      "but also clean, maintainable, and elegant. A lifelong learning zealot, I struggle to " +
      "satiate my desire to learn every software tool out there.",
    image: "/images/about_page/ryan_antarctica.jpg",
  },
  sectionTwo: {
    title: "Project Work",
    content:
      "My project work stems from a strong drive to solve practical problems with technology. I enjoy taking on exploratory projects that let me delve into new concepts and emerging tech, always aiming to build effective solutions. " +
      "I sometimes leverage Large Language Models (LLMs) in my work, primarily for exploring new topics, surmounting blockages on complex topics, and significantly accelerating development cycles. I focus on applying these tools strategically to improve problem-solving and efficiency within my projects. " +
      "No matter the project or the tools I'm using, I stick to industry-standard tools and robust coding practices. I write code that is clean, maintainable, and performs well, making sure that all my projects, even the most experimental ones, are built on a solid and professional foundation.",
    image: "/images/about_page/california_scenery.jpg",
  },
  sectionThree: {
    title: "Interests & Hobbies",
    content:
      "When I'm not at my keyboard, you can find me exploring the great outdoors, " +
      "shredding the ski slopes, or finding new eats around New England. I'm endlessly " +
      "curious about the world and love to travel the world, from Canada and California " +
      "to Chile and Antarctica. Recently, I've read some interesting books like Zero to One by Peter Thiel and The Pragmatic Programmer by Andrew Hunt and David Thomas, which have inspired me to think differently about technology and software development. ",
    image: "/images/about_page/skis.jpg",
  },
  ctaSection: {
    vitae: {
      title: "View My Vitae",
      description:
        "See a detailed timeline of my professional experience and accomplishments.",
      linkText: "Read Vitae",
      href: "/vitae",
    },
    contact: {
      title: "Get in Touch",
      description:
        "Have a project in mind or just want to say hi? I'd love to hear from you.",
      linkText: "Contact Me",
      href: "/contact",
    },
  },
};

export const values: Value[] = [
  {
    icon: Code,
    title: "Craftsmanship",
    description:
      "A commitment to writing clean, elegant, and maintainable code.",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    description:
      "Driven by a passion for exploring new technologies and methodologies.",
  },
  {
    icon: Users,
    title: "User-Focused",
    description:
      "Building applications that provide real-world value and a great user experience.",
  },
];
