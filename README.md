kido-scraper-script-generator
=============================

# How to install this Chrome extension
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

#To-Do:

- **\[DONE\]** On "New Site" --> use current site name and URL.
- (Nice to have) New Site: "Go" button to navigate to URL.
- Add new Step 'form':
	- (Nice to have) Submit button: what if there's no button? Put a checkbox for sending an "enter"?
	- **\[DONE\]** Redirect to Site details (instead of Sites list).
	- **\[DONE\]** Add Cancel button logic.
	- Validation in form
- Site Details
	- Edit step
	- Delete Step
- Add new Step 'scrape':
	- If the user attempts to scrape without having specified steps first, an error is thrown: `TypeError: Cannot read property 'steps' of undefined`
	- add more attributes
- Export
	- **\[DONE\]** Display code in a \<pre\>.
- Reuse the navigation header (breadcrumb) somehow.