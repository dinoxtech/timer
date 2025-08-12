# DinoxTech Timer

[🇺🇦 Українська](#dinoxtech-timer-українська) | [🇬🇧 English](#dinoxtech-timer-english)

---

## DinoxTech Timer (English)

A modern, beautiful timer and stopwatch application built with Electron. Features multiple themes, customizable presets, and a clean, intuitive interface.

![License](https://img.shields.io/badge/license-GPL-3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey.svg)
![Electron](https://img.shields.io/badge/electron-27.0.0-47848F.svg)

### ✨ Features

- **Timer Mode**: Set custom countdown timers with preset options
- **Stopwatch Mode**: Track elapsed time with lap functionality
- **Multiple Themes**: 10+ beautiful color themes including gradient and solid colors
- **Custom Themes**: Create your own color combinations
- **Compact Mode**: Minimal interface for focused work
- **System Tray Integration**: Quick access and background operation
- **Notification System**: Audio and visual alerts when timer expires
- **Multi-language Support**: English and Ukrainian interfaces
- **Cross-platform**: Works on Linux, Windows, and macOS

### 📸 Screenshots

<details>
<summary>View Screenshots</summary>

- Timer interface with gradient themes
- Stopwatch with lap tracking
- Settings panel with theme selection
- Compact mode for minimal distraction

</details>

### 🚀 Installation

#### Option 1: Flatpak (Linux)
```bash
# Coming soon to Flathub
flatpak install flathub com.dinoxtech.Timer
flatpak run com.dinoxtech.Timer
```

#### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/dinoxtech/timer.git
cd timer/electron

# Install dependencies
npm install

# Run the application
npm start

# Build for your platform
npm run dist
```

#### Option 3: Download Release
Download the latest release from the [Releases](https://github.com/dinoxtech/timer/releases) page:
- **Linux**: `.AppImage` file
- **Windows**: `.exe` installer
- **macOS**: `.dmg` file

### 🛠️ Development

#### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

#### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/dinoxtech/timer.git
cd timer/electron

# Install dependencies
npm install

# Start in development mode
npm start

# Build distributables
npm run build  # For current platform
npm run dist   # Linux AppImage
```

#### Project Structure
```
timer/
├── electron/           # Electron application source
│   ├── main.js        # Main process
│   ├── renderer.js    # Renderer process
│   ├── index.html     # Main window HTML
│   ├── styles.css     # Application styles
│   └── assets/        # Icons and resources
├── com.dinoxtech.Timer.yml     # Flatpak manifest
├── com.dinoxtech.Timer.desktop # Desktop entry
└── com.dinoxtech.Timer.metainfo.xml # AppStream metadata
```

### 🎨 Themes

The application includes 10 pre-built themes:
- **Default** - Purple gradient
- **Ocean** - Blue to cyan gradient
- **Sunset** - Multi-color gradient
- **Forest** - Green tones
- **Fire** - Orange to yellow
- **Night** - Dark blue gradient
- **Cherry** - Red gradient
- **Mint** - Teal colors
- **Royal** - Navy blue
- **Cosmic** - Pink to purple
- **Custom** - Create your own

### ⚙️ Configuration

Settings are stored locally and include:
- Language preference (English/Ukrainian)
- Theme selection
- Custom color schemes
- Notification volume
- Close button behavior (minimize to tray or quit)

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Notification sound: "Hedwig's Theme" by John Williams
- Icons and design inspiration from modern UI/UX principles

### 📞 Contact

**DinoxTech** - Software Development
- Website: [https://dinoxtech.com](https://dinoxtech.com)
- GitHub: [@dinoxtech](https://github.com/dinoxtech)

---

## DinoxTech Timer (Українська)

Сучасний та красивий додаток таймера та секундоміра, створений на Electron. Має багато тем, налаштовувані пресети та чистий, інтуїтивний інтерфейс.

![Ліцензія](https://img.shields.io/badge/ліцензія-GPL-3.0-blue.svg)
![Платформа](https://img.shields.io/badge/платформа-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey.svg)
![Electron](https://img.shields.io/badge/electron-27.0.0-47848F.svg)

### ✨ Можливості

- **Режим таймера**: Встановлення власних таймерів зворотного відліку з попередніми налаштуваннями
- **Режим секундоміра**: Відстеження часу з функцією кіл
- **Багато тем**: 10+ кольорових тем з градієнтами та однотонними кольорами
- **Власні теми**: Створення власних кольорових комбінацій
- **Компактний режим**: Мінімальний інтерфейс для зосередженої роботи
- **Інтеграція з системним треєм**: Швидкий доступ та робота у фоні
- **Система сповіщень**: Звукові та візуальні сповіщення при закінченні таймера
- **Підтримка кількох мов**: Англійський та український інтерфейси
- **Кросплатформеність**: Працює на Linux, Windows та macOS

### 📸 Знімки екрана

<details>
<summary>Переглянути знімки</summary>

- Інтерфейс таймера з градієнтними темами
- Секундомір з відстеженням кіл
- Панель налаштувань з вибором теми
- Компактний режим для мінімального відволікання

</details>

### 🚀 Встановлення

#### Варіант 1: Flatpak (Linux)
```bash
# Незабаром на Flathub
flatpak install flathub com.dinoxtech.Timer
flatpak run com.dinoxtech.Timer
```

#### Варіант 2: Збірка з вихідного коду
```bash
# Клонувати репозиторій
git clone https://github.com/dinoxtech/timer.git
cd timer/electron

# Встановити залежності
npm install

# Запустити додаток
npm start

# Зібрати для вашої платформи
npm run dist
```

#### Варіант 3: Завантажити реліз
Завантажте останній реліз зі сторінки [Releases](https://github.com/dinoxtech/timer/releases):
- **Linux**: файл `.AppImage`
- **Windows**: інсталятор `.exe`
- **macOS**: файл `.dmg`

### 🛠️ Розробка

#### Передумови
- Node.js 18+ 
- npm або yarn
- Git

#### Налаштування середовища розробки
```bash
# Клонувати репозиторій
git clone https://github.com/dinoxtech/timer.git
cd timer/electron

# Встановити залежності
npm install

# Запустити в режимі розробки
npm start

# Зібрати дистрибутиви
npm run build  # Для поточної платформи
npm run dist   # Linux AppImage
```

#### Структура проекту
```
timer/
├── electron/           # Вихідний код Electron додатку
│   ├── main.js        # Головний процес
│   ├── renderer.js    # Процес рендерингу
│   ├── index.html     # HTML головного вікна
│   ├── styles.css     # Стилі додатку
│   └── assets/        # Іконки та ресурси
├── com.dinoxtech.Timer.yml     # Flatpak маніфест
├── com.dinoxtech.Timer.desktop # Desktop файл
└── com.dinoxtech.Timer.metainfo.xml # AppStream метадані
```

### 🎨 Теми

Додаток включає 10 вбудованих тем:
- **Default** - Фіолетовий градієнт
- **Ocean** - Градієнт від синього до блакитного
- **Sunset** - Багатокольоровий градієнт
- **Forest** - Зелені тони
- **Fire** - Від оранжевого до жовтого
- **Night** - Темно-синій градієнт
- **Cherry** - Червоний градієнт
- **Mint** - Бірюзові кольори
- **Royal** - Темно-синій
- **Cosmic** - Від рожевого до фіолетового
- **Custom** - Створіть власну

### ⚙️ Налаштування

Налаштування зберігаються локально та включають:
- Мовні налаштування (англійська/українська)
- Вибір теми
- Власні кольорові схеми
- Гучність сповіщень
- Поведінка кнопки закриття (згортання в трей або вихід)

### 🤝 Внесок

Внески вітаються! Будь ласка, не соромтеся надсилати Pull Request.

1. Зробіть форк репозиторію
2. Створіть гілку функції (`git checkout -b feature/AmazingFeature`)
3. Закомітьте зміни (`git commit -m 'Додати зміни'`)
4. Запушіть гілку (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

### 📝 Ліцензія

Цей проект ліцензований під ліцензією GPL-3.0 - дивіться файл [LICENSE](LICENSE) для деталей.

### 🙏 Подяки

- Створено за допомогою [Electron](https://www.electronjs.org/)
- Звук сповіщення: "Hedwig's Theme" від John Williams
- Іконки та дизайн натхнені сучасними принципами UI/UX

### 📞 Контакти

**DinoxTech** - Розробка програмного забезпечення
- Вебсайт: [https://dinoxtech.com](https://dinoxtech.com)
- GitHub: [@dinoxtech](https://github.com/dinoxtech)

---

© 2025 DinoxTech. All rights reserved. | Всі права захищені.