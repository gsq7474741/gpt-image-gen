# GPT-Image-Gen

<div align="center">
  <img src="public/screenshot.png" alt="GPT-Image-Gen Screenshot" width="200"/>
  <h3>Intelligent Image Generation Application Based on OpenAI's Latest GPT-Image-1 Model</h3>
  <p><a href="README.md">中文文档</a> | English</p>
</div>

## 🌐 Online Demo [![Netlify Status](https://api.netlify.com/api/v1/badges/bad752a0-0023-4bc2-bd45-e29b7da1eb94/deploy-status)](https://app.netlify.com/sites/gpt-image-gen-51v7f/deploys)

No installation needed, directly access our online demo version, you need to provide your own OpenAI API key and API base URL:

[http://gpt-image-gen.windsurf.build](http://gpt-image-gen.windsurf.build)

## 🌟 About GPT-Image-1 Model

GPT-Image-1 is OpenAI's latest native multimodal image generation model and the core technology driving the image generation feature in ChatGPT. In the first week of its release, it was used by over 130 million users worldwide, creating more than 700 million images.

As a professional-grade image generation model, GPT-Image-1 has the following outstanding features:

- **Diverse Style Generation**: Capable of creating a wide variety of image styles to meet different creative needs
- **Precise Instruction Following**: Faithfully follows custom guidelines to accurately realize user intentions
- **World Knowledge Integration**: Leverages rich world knowledge to create more coherent and contextually appropriate images
- **Accurate Text Rendering**: Capable of rendering text accurately in images, solving a pain point of previous models
- **Multi-Image Editing Capabilities**: Supports combining and fine-tuning multiple images

The model has been adopted by leading global enterprises and startups, including Adobe, Figma, Canva, Wix, and others, and is widely applied in creative design, e-commerce, education, enterprise software, gaming, and many other fields.

For more details, visit the OpenAI official website: [https://openai.com/index/image-generation-api/](https://openai.com/index/image-generation-api/)

## ✨ Features

- 🖼️ **Multi-Mode Image Generation**: Support for generating images from text, editing existing images, or creating mixed compositions
- 🧠 **Powerful GPT-Image-1 Model**: Using OpenAI's latest image generation model for higher quality image output
- 📱 **Modern Interface**: Responsive user interface built with Next.js 19 and React 19
- 💬 **Conversational Interaction**: Interact with AI through a chat interface, saving conversation history
- 📋 **Convenient Image Upload**: Support for drag-and-drop, file selection, and clipboard paste for image uploads
- 🔄 **Multi-Session Management**: Create and switch between multiple independent conversation sessions
- 🔧 **Custom API Settings**: Support for custom OpenAI API keys and base URLs

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- OpenAI API key (supporting the GPT-Image-1 model)

> **Recommended**: For stable and reliable API services, we recommend [CloseAI](https://referer.shadowai.xyz/r/17236) - a leading OpenAI proxy platform in China, providing 100% official forwarding, high-availability architecture, and self-service invoice support.

### Installation

```bash
# Clone the repository
git clone https://github.com/gsq7474741/gpt-image-gen.git
cd gpt-image-gen

# Install dependencies
npm install
# Or use pnpm
pnpm install
```

### Running the Development Server

```bash
npm run dev
# Or use pnpm
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 User Guide

1. **Set API Key**: When using for the first time, click the settings icon to enter your OpenAI API key
2. **Create New Conversation**: Click the "New Conversation" button in the sidebar to start a new session
3. **Generate Images**:
   - Enter a text description and send to generate a brand new image
   - Upload an image and add a description to edit or enhance an existing image
   - Upload multiple images to create a new image with mixed styles
4. **Manage Conversations**: Use the sidebar to switch, rename, or delete conversations

## 💡 Advanced Features

### Image Editing Modes

Upload one or more images and add text prompts to guide the AI on how to edit or enhance the images. Supports the following operations:

- Single Image Editing: Modify, enhance, or transform a single image
- Multi-Image Mixing: Combine elements or styles from multiple images into a new image
- Mask Editing: Upload an original image and a mask to precisely control the editing area

### Clipboard Support

Paste images directly from the clipboard (Ctrl+V or use the paste button) without needing to save files before uploading.

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) + [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **API Integration**: [OpenAI API](https://platform.openai.com/) (GPT-Image-1 model)

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 👷 Contributing

We warmly welcome community contributions! If you're interested in participating in this project, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

You can contribute in various ways:

- Adding new features
- Fixing bugs
- Improving documentation
- Optimizing code
- Reporting issues

We especially welcome contributions for multilingual support. If you can help us translate the application into more languages, it would be greatly appreciated!

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for providing the powerful GPT-Image-1 model
- [CloseAI](https://referer.shadowai.xyz/r/17236) for providing stable and reliable API services
- [Next.js](https://nextjs.org/) team for their excellent framework
- All contributors and users

---

<div align="center">
  <p>If you like this project, please consider giving it a ⭐️</p>
</div>
