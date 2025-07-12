# VK Wash

VK Wash is a modern web platform designed to streamline laundry and cleaning service management. It enables the VK Wash team to efficiently handle customer orders, generate and share invoices, record payments, and track service history—all from a single dashboard.

**Website:** [https://vkwash.in](https://vkwash.in)

---

## Features

- Manage customer orders and billing
- Share order details and payment links via WhatsApp
- Track payment status and service history

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, shadcn-ui
- **Backend & Database:** Firebase (Firestore, Auth, Storage)
- **Other Services:** Cloudinary (for invoice images), WhatsApp Web API

---

## Getting Started

### Prerequisites

- [Node.js & npm](https://github.com/nvm-sh/nvm#installing-and-updating) installed

### Local Development

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/vk-wash-web.git
   cd vk-wash-web
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**

   - Copy `.env.example` to `.env` and add your API keys and configuration.

4. **Start the development server:**

   ```sh
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Editing the Code

You can use your preferred IDE to work locally, or edit files directly in GitHub:

- **Edit in GitHub:**

  - Navigate to the desired file(s).
  - Click the "Edit" button (pencil icon).
  - Make your changes and commit.

- **GitHub Codespaces:**
  - Click the "Code" button in your repo.
  - Select the "Codespaces" tab.
  - Launch a new Codespace and edit files directly.

---

<details>
<summary>Deployment & Custom Domains</summary>

### Deployment

Deployment can be handled via your preferred platform or static hosting provider.

### Custom Domain

To connect a custom domain, refer to your hosting provider's documentation.


</details>

---

## Security Notice

- Sensitive keys and configuration are managed via `.env` files, which are **not tracked** by git.
- Do **not** share your `.env` or secret files publicly.

---




