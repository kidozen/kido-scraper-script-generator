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

# Extension packaging and publishing (only for Kidozen developers)
- Do not forget to bump up the version in the manifest file.
- Make sure all the tests are passing and then run `npm run bundle`.
- From the `extension` subdirectory, run this command: `zip -r kido-scraper.zip *`
- Log in to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer) (ask someone for the proper credentials)
- `Edit` the listing item corresponding to this extension and upload the new package using the button `Upload updated package`
