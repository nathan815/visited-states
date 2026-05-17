# 🗺️ US States Visited Tracker

A simple, interactive website to track which US states you've visited and how many times. Built with vanilla HTML, CSS, and JavaScript. Data is stored in a JSON file and hosted on GitHub Pages.

## Features

- 🗺️ Interactive US map with state-by-state visualization
- 📊 Real-time statistics (states visited, total visits, coverage percentage)
- 🎨 Color-coded states based on visit frequency
- 📱 Responsive design that works on desktop and mobile
- 🔄 Easy to update via GitHub (just edit `data.json`)
- 🚀 Deployed on GitHub Pages (no server needed)

## Quick Start

### 1. Edit Your Visited States

Edit the `data.json` file and update the `visits` count for each state:

```json
{
  "states": [
    { "name": "California", "visits": 3 },
    { "name": "Texas", "visits": 1 },
    // ... more states
  ]
}
```

### 2. Push to GitHub

```bash
git add data.json
git commit -m "Update visited states"
git push
```

The website will automatically update!

## Color Legend

- **Gray**: Not visited
- **Light Blue**: 1 visit
- **Medium Blue**: 2 visits
- **Darker Blue**: 3 visits
- **Deep Purple**: 4+ visits

## File Structure

```
visited-states/
├── index.html       # Main HTML page
├── script.js        # Interactive map and data loading
├── data.json        # Your visit data (edit this!)
├── README.md        # This file
└── .gitignore       # Git ignore rules
```

## How It Works

1. The website loads `data.json` when you open it
2. States are colored based on visit counts
3. Statistics are calculated automatically
4. All processing happens in the browser (no server needed)

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `visited-states`)
2. Push this code to your repo
3. Go to **Settings → Pages**
4. Set source to **main branch → root** and save
5. Your site will be live at: `https://yourusername.github.io/visited-states`

## Customize

- **Colors**: Edit the CSS in `index.html` (`.state.visited-*` classes)
- **Map Layout**: Adjust state positions in `getStatePositions()` in `script.js`
- **Styling**: Modify the `<style>` section in `index.html`

## To Update Your Data

1. Edit `data.json` with your visit counts
2. Commit and push to GitHub
3. Refresh the website (may need to hard-refresh: Cmd+Shift+R on Mac)

## Example Data Format

```json
{
  "states": [
    { "name": "Alabama", "visits": 0 },
    { "name": "Alaska", "visits": 0 },
    { "name": "Arizona", "visits": 1 },
    { "name": "California", "visits": 3 },
    // ... all 50 states + DC
  ]
}
```

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge).

## License

Free to use and modify. Share the love! ❤️

---

**Made with ❤️ using vanilla HTML, CSS, and JavaScript**
