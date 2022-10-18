git checkout pioneer-dev
npx tailwindcss -o src/app.css --minify
git add .
now=$(date)
git commit -m "deploy $now"
git push -f origin main
git reset --hard origin/pioneer-dev