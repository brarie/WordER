# WordER 📚

> A powerful desktop vocabulary learning application with flashcards and test generation

WordER is an Electron-based desktop application designed to help you learn and memorize vocabulary efficiently. Create organized word lists, hide/reveal definitions, and generate randomized tests for effective learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## ✨ Features

### 📑 Tab Management
- Create multiple tabs (like Excel sheets) for organizing different word lists
- Assign unique names to each tab for easy identification
- Quick tab switching for seamless navigation

### ✍️ Word Entry System
- Add vocabulary entries with:
  - **English word**: The word you want to learn
  - **Korean meaning**: Translation and definition
  - **Example sentence**: Context and usage examples
- Individual field visibility toggle (eye icon)
- Global show/hide all feature for testing yourself

### 💾 Local Data Storage
- Built-in SQLite database for fast, reliable local storage
- All your data stays on your device
- No internet connection required

### 🧪 Test Generator
- Select one or more tabs to generate a custom test
- Automatic randomization of word order
- Perfect for self-assessment and practice

### 📤 Export Capabilities
- **PDF Export**: Print-ready vocabulary lists
- **Excel Export**: Editable spreadsheets for further customization
- Export individual tabs or combine multiple tabs

### ☁️ Cross-Device Sync (Coming Soon)
- Lightweight synchronization via Google Drive/Dropbox
- Access your vocabulary on multiple devices
- No complex server setup required

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/WordER.git
cd WordER
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run electron:dev
```

### Building for Production

Create a distributable package:
```bash
npm run electron:build
```

The built application will be available in the `release/` directory.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Electron 31
- **Build Tool**: Vite 5
- **UI Components**: shadcn/ui (Tailwind CSS)
- **State Management**: Zustand
- **Database**: better-sqlite3
- **Export Tools**: jsPDF, xlsx

## 📖 Usage

1. **Create a Tab**: Click the "+" button to create a new word list
2. **Add Words**: Fill in English word, Korean meaning, and example sentences
3. **Study Mode**: Use the eye icon to hide/show specific fields while studying
4. **Generate Test**: Select tabs and click "Generate Test" for a randomized quiz
5. **Export**: Save your word lists as PDF or Excel files

## 🗂️ Project Structure

```
WordER/
├── electron/           # Electron main process
├── src/               # React application
│   ├── components/    # UI components
│   ├── lib/          # Utilities
│   └── App.tsx       # Main app
├── dist/             # Frontend build output
└── release/          # Packaged applications
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Roadmap

- [x] Project setup with Electron + React + TypeScript
- [x] Basic UI structure with shadcn/ui
- [ ] Database schema and IPC handlers
- [ ] Tab management functionality
- [ ] Word CRUD operations
- [ ] Hide/show visibility controls
- [ ] Test generator
- [ ] PDF/Excel export
- [ ] Cloud synchronization
- [ ] Settings and preferences
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

Project Link: [https://github.com/yourusername/WordER](https://github.com/yourusername/WordER)

---

Made with ❤️ for language learners
