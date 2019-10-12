npm run build
git add .
git commit -m 'rebuild'
git push
npm version patch
npm publish --access public
