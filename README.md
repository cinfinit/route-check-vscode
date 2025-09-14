
# 🔗 RouteCheck — Broken Link Buster for VS Code

Tired of chasing 404s like it's your job?  
Let **RouteCheck** do the dirty work — directly from VS Code.

This extension helps you **spot broken URLs** like a boss. Whether you're checking a single suspicious link or a whole army of them from a file, RouteCheck will scan, validate, and report the results — all without leaving your code editor.

---

## 🚀 Features

- 🔍 **Single Link Checker**  
  Input a URL → Get the HTTP status → Done.

- 📂 **File-Based Batch Checker**  
  Feed it a `.txt` file with one link per line. Choose output format:
  - `text` (default)
  - `csv` (Excel nerds, rejoice)
  - `json` (for the API-inclined)

- ⚡ **Parallel Mode**  
  Because time is money. Add parallel checking to batch jobs for faster scans.

- 🧠 **Smart URL Handling**  
  - Accepts links with or without `https://`
  - Skips invalid garbage (looking at you, "hello world")

- 📤 **Clean Output Reports**  
  Results are saved automatically as:
  - `link_status_report.txt`
  - `link_status_report.csv`
  - `link_status_report.json`

- 🪄 All powered by Node.js and good intentions.

---

## 🛠️ Usage

### 👉 Command Palette (Ctrl+Shift+P or ⌘+Shift+P)

Search for:

- `Check Single Link`
- `Check Links in File`

Follow the prompts:
1. Enter the URL or select a file
2. Choose output format
3. (Optional) Enable parallel mode
4. View results in the Output panel and saved file

---

## 📦 File Format Example

**links.txt**
```

https://google.com
example.com
not a url
www.github.com

```

✅ RouteCheck auto-corrects `example.com` and skips the broken stuff like `not a url`.

---

## 📂 Output Example (CSV)
```csv
URL, Status Code, Status Message
https://google.com, 200, OK
https://example.com, 200, OK
https://www.github.com, 200, OK
````

---

## 🤖 Built With
* Zero nonsense

---

## ✨ Why?

Because broken links suck.
And may be you shouldn't have to leave VS Code to fix them. And may be that's the reason you're here.

---

## 🧙 Author

Crafted by a [cinfinit](https://github.com/cinfinit) who’s clicked too many dead links.
Maintained with love, and the occasional 418 status code.

---

## 📣 Feedback

Got an idea? Found a bug?
Open an issue or start a discussion — we love constructive chaos.

---

Happy link hunting! 🔗💥


