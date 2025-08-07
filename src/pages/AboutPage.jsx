import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FiInfo } from 'react-icons/fi';

// Markdown content from the artifact
const aboutContent = `
# About DropnShare

Welcome to **DropnShare**, your ultimate platform for seamless content sharing and collaboration! Whether you're a developer, writer, or content creator, DropnShare empowers you to share, store, and manage your text, code, and multimedia files effortlessly.

## What is DropnShare?

DropnShare is a user-friendly web application designed to simplify the process of sharing snippets of code, text, and multimedia files. With its intuitive interface and powerful features, DropnShare is perfect for professionals, hobbyists, and teams looking to collaborate or showcase their work.

## Key Features

- **Instant Snippet Sharing**: Create and share code or text snippets with a unique, shareable link in seconds. Add titles, tags, and expiration dates to keep your content organized and secure.
- **Code & Text Editing**: Write and edit code in various programming languages (JavaScript, Python, HTML, and more) or plain text with a robust editor powered by Monaco. Toggle between code and text modes effortlessly.
- **AI-Powered Insights**: Leverage advanced AI features to analyze code, generate completions, detect languages, summarize content, and identify security issues, making your work smarter and more efficient.
- **Multimedia Uploads**: Upload and share files like PDFs, images, videos, and audio (up to 10MB) alongside your snippets, perfect for tutorials, presentations, or portfolios.
- **Password Protection & Privacy**: Secure your snippets with optional passwords and private sharing options to control who can access your content.
- **Session History & Autosave**: Keep track of your snippets with session history and autosave drafts to never lose your work.
- **Responsive Design**: Access DropnShare on any device—desktop, tablet, or mobile—with a seamless experience, including fullscreen editing and mobile-friendly controls.

## Why Choose DropnShare?

DropnShare is built to make sharing and collaboration as simple as possible. Whether you're sharing a quick code snippet with a colleague, uploading a multimedia tutorial, or storing drafts for later, DropnShare offers a fast, secure, and feature-rich platform. Our AI tools enhance your productivity, while our clean design ensures ease of use for everyone.

## Get Started Today!

Join thousands of users who trust DropnShare to share their ideas, code, and files. Start creating, sharing, and collaborating now—no sign-up required! Simply paste your content, customize your settings, and share with the world.

DropnShare—where ideas meet simplicity.
`;

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 sm:p-6 my-4 sm:my-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <FiInfo className="text-blue-500 text-lg sm:text-xl" />
        <h1 className="text-xl sm:text-2xl font-bold text-white">About DropnShare</h1>
      </div>
      <div className="prose prose-invert max-w-none text-slate-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4 sm:mt-6 mb-2 sm:mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl sm:text-2xl font-semibold text-white mt-3 sm:mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="text-sm sm:text-base text-slate-300 mb-2 sm:mb-4 leading-relaxed" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 sm:pl-5 text-sm sm:text-base text-slate-300 mb-2 sm:mb-4" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1 sm:mb-2" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
          }}
        >
          {aboutContent}
        </ReactMarkdown>
      </div>
      {/* Ad Placement Section */}
      <div className="mt-6 sm:mt-8 p-4 bg-slate-900 border border-slate-600 rounded-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Our Partners</h2>
        <div className="text-center">
          {/* Placeholder for ad content */}
          <div className="bg-slate-700 h-32 sm:h-40 flex items-center justify-center rounded-lg">
            <p className="text-slate-400 text-sm sm:text-base">Ad Space</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;