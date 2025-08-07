# DropnShare

**DropnShare** is a modern, user-friendly web application for seamless sharing of code snippets, text, and multimedia files. Built with **React** and powered by **AI-driven features**, DropnShare simplifies collaboration for developers, writers, and content creators.

Whether you're sharing a quick code snippet, a multimedia tutorial, or a private document, DropnShare offers a **fast**, **secure**, and **feature-rich** platform.

---

## 📚 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contact](#contact)

---

## ✨ Features

- **Instant Snippet Sharing**  
  Create and share code or text snippets with unique, shareable links. Customize with titles, tags, and expiration dates.

- **Code & Text Editing**  
  Write and edit in multiple programming languages (JavaScript, Python, HTML, etc.) or plain text using a **Monaco-powered editor**.

- **AI-Powered Tools**  
  Leverage AI for:
  - Code analysis
  - Code completions
  - Language detection
  - Content summarization
  - Security checks

- **Multimedia Uploads**  
  Share files (PDFs, images, videos, audio) up to **10MB** alongside snippets — ideal for tutorials or portfolios.

- **Security & Privacy**  
  Protect snippets with **passwords** and **private sharing** options.

- **Session History & Autosave**  
  Track snippets with session history and autosave drafts to prevent data loss.

- **Responsive Design**  
  Enjoy a seamless experience on desktop, tablet, or mobile with **fullscreen editing** and **mobile-friendly controls**.

- **QR Code Sharing**  
  Generate QR codes for easy snippet sharing.

- **Ad Support**  
  Monetize content with integrated **ad placements** (e.g., on the About page).

---

## 🚀 Demo

Check out the live demo: **[DropnShare Live](#)**

### Screenshots:
<!-- Add image links here -->
<!-- ![Screenshot 1](link-to-screenshot1.png) -->
<!-- ![Screenshot 2](link-to-screenshot2.png) -->

---

## 🛠 Technologies

### Frontend:
- React
- React Router
- Tailwind CSS
- Monaco Editor

### Libraries:
- Axios
- React Hot Toast
- React Markdown
- PrismJS
- v-qr-code-next

### Backend:
- Vite (for development)
- API integration (assumed Node.js backend)

### Tools:
- React Icons
- Lodash (debounce)
- `remark-gfm`, `rehype-raw`

---

## ⚙️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A backend API server  
  (Configure `VITE_APP_API_URL` in `.env`)

### Steps

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/dropnshare.git
cd dropnshare
