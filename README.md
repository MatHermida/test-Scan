# Pre
Enable GitHub Pages: Go to your repository settings, navigate to the "Pages" section, and ensure the source is set to gh-pages branch.

npm install gh-pages --save-dev

"homepage": "https://mathermida.github.io/test-Scan/",

"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# To run
git add .
git commit -m ""
git push origin master

npm run deploy