kido-scraper-script-generator
=============================

# How to install this Chrome extension
- Clone this repository, for example:
    - `git clone https://github.com/kidozen/kido-scraper-script-generator/`
- Make sure you are using Node 0.10.x. If you use nvm:
    - `nvm use 0.10`
- Install all project dependencies
    - `npm install`
- Execute the build that will "browserify" the project
    - `npm run bundle`
- Install this extension in Chrome
    - Go to Chrome --> More tools --> Extensions or simply enter `chrome://extensions/` in the address bar.
    - Make sure the checkbox "Developer mode" is checked.
    - Click on "Load unpacked extension..." and select the "extensions" directory of this project.
- Verify the installation
    - Open any page and toggle Chrome's Developer Tools (More tools --> Developer Tools)
    - You should see a small tab tagged "Kido Scraper". This reflects the extension has been installed successfully.
