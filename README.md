# GitSwitch-Gui

<div align="center">

![GitSwitch Logo](https://raw.githubusercontent.com/biohacker0/GitSwitch-Gui/main/src-tauri/icons/icon.png)

_Effortlessly manage multiple GitHub accounts from your desktop_

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/biohacker0/GitSwitch-Gui.svg)](https://github.com/biohacker0/GitSwitch-Gui/releases/)

</div>

<br>

<div>
   [!GitSwitch Image](![image](https://github.com/user-attachments/assets/bb0d0007-e3af-4b3a-b6f6-30c5a81bca35)
)
</div>

GitSwitch-Gui is a powerful desktop application that simplifies the management of multiple GitHub accounts. Built with Tauri and React with rust, it offers a seamless experience for developers who need to switch between different GitHub identities effortlessly.

## 🌟 Features

### Account Management

- 🆕 Add new GitHub accounts with ease
- 🔄 Switch between accounts with a single click
- 🗑️ Remove individual accounts or clear all accounts
- 👀 View all added accounts in a clean, organized list

### SSH Key Handling

- 🔑 Automatic SSH key generation for each account
- 📋 Easy copying of SSH keys to clipboard
- 🔍 View SSH keys for any account at any time

### User Interface

- 🎨 Intuitive and responsive design built with Ant Design components
- 🌓 Toggle between light and dark themes
- 📊 Clear visual indicators for active accounts

### Security

- 🔒 Local storage of account information for enhanced privacy
- 🛡️ No storage of GitHub passwords or tokens

### Cross-Platform Support

- 🖥️ Works on Windows, macOS, and Linux
- 📦 Easy installation process for each platform

### Utility Features

- 🔄 Automatic refresh of account list after actions
- ℹ️ Informative messages for successful actions and errors
- ❓ Built-in help and guide section for easy onboarding

## 🚀 Installation

Download the latest release for your OS from the [Releases](https://github.com/biohacker0/GitSwitch-Gui/releases) page.

### Quick Start Guide

1. **Windows**

   - Download the `.msi` installer
   - Run the installer and follow the on-screen instructions

2. **macOS**

   - Download the `.dmg` file
   - Open the `.dmg` file
   - Drag the GitSwitch app to your Applications folder

3. **Linux**
   - Download the `.AppImage` file
   - Make it executable: `chmod +x GitSwitch.AppImage`
   - Run it: `./GitSwitch.AppImage`

## 🎯 Usage

1. **Launch** the GitSwitch application.

2. **Add a new account**:

   - Navigate to the "Add Account" tab.
   - Enter your name and email associated with your GitHub account.
   - Click "Add Account".
   - Copy the generated SSH key and add it to your GitHub account settings.

3. **Switch accounts**:

   - Go to the "Switch Account" tab.
   - Click "Switch" next to the account you want to use.
   - The active account will be highlighted.

4. **View SSH keys**:

   - Use the "Show SSH Key" button next to each account to view its SSH key.
   - You can easily copy the key to your clipboard.

5. **Remove accounts**:

   - Navigate to the "Remove Account" tab to delete individual accounts.
   - Use the "Remove All Accounts" option to clear all accounts (use with caution).

6. **Access Help/Guide**:
   - Click on the "Help/Guide" tab for detailed information on using the app.

## 🛠️ Building from Source

To build GitSwitch-Gui from source, follow these steps:

1. Ensure you have [Node.js](https://nodejs.org/) (v14 or later) and [Rust](https://www.rust-lang.org/tools/install) installed.

2. Clone the repository:

   ```
   git clone https://github.com/biohacker0/GitSwitch-Gui.git
   cd GitSwitch-Gui
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Run the development version:

   ```
   npm run tauri dev
   ```

5. Build for production:
   ```
   npm run tauri build
   ```

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request.

Please make sure to update tests as appropriate and adhere to the existing coding style.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

If you find GitSwitch-Gui useful, consider [buying me a coffee](https://buymeacoffee.com/biohacker0)!

---

GitSwitch-Gui is a personal project made open-source to benefit the developer community. It's designed as a minimalist, go-to tool for managing multiple GitHub accounts without hassle. Enjoy using GitSwitch!
