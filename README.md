# Sentix.ai 🧠

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg?logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Active-success.svg)

**Sentix.ai** is a modern, client-side intelligent document scanner built with React. It uses optical character recognition (OCR) to extract text from images and performs instant local analysis to determine sentiment and extract key entities like financial figures, dates, and emails.

---

## 🚀 Features

-   **📄 Instant OCR:** Powered by [Tesseract.js](https://github.com/naptha/tesseract.js), extracting text directly in the browser.
-   **🧠 Local Intelligence Engine:** No API keys or cloud servers required. All sentiment analysis and data extraction happen on the client side for maximum privacy.
-   **📊 Sentiment Analysis:** Automatically detects the tone of the document (Positive, Negative, or Neutral) using lexical analysis.
-   **🔍 Smart Extraction:** Identifies and highlights:
    -   Financials (Currencies)
    -   Dates & Timelines
    -   Email Addresses
-   **🎨 Modern UI:** Features a responsive "Bento Grid" layout, glassmorphism effects, and smooth animations using Tailwind CSS.

---

## 🛠️ Tech Stack

* **Frontend Framework:** [React](https://reactjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **OCR Engine:** [Tesseract.js](https://tesseract.projectnaptha.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Build Tool:** Vite (Recommended) or Create React App

---

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/sentix-ai.git](https://github.com/yourusername/sentix-ai.git)
    cd sentix-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Install required packages** (if not already in package.json)
    ```bash
    npm install tesseract.js lucide-react tailwindcss postcss autoprefixer
    ```

4.  **Start the development server**
    ```bash
    npm run dev
    ```

5.  **Open in browser**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 📂 Project Structure### Key Functions

* **`analyzeLocal(text)`**: The core logic function. It tokenizes the OCR output, compares it against `POSITIVE_WORDS` and `NEGATIVE_WORDS` arrays, calculates a net score, and uses Regex to extract entities.

---

## 💡 How It Works

1.  **Upload:** Users drag and drop an image (Receipt, Letter, Email screenshot) into the upload zone.
2.  **Process:** Tesseract.js initiates a web worker to recognize text within the image.
3.  **Analyze:** The raw text is passed to the local intelligence engine.
4.  **Visualize:** results are mapped to the Bento Grid dashboard, changing color themes (Green/Emerald for positive, Red/Rose for negative) based on the calculated sentiment score.

---

## 🔮 Roadmap

- [ ] **PDF Support:** Enable parsing of multi-page PDF documents.
- [ ] **LLM Integration:** Optional connection to OpenAI/Gemini APIs for advanced summarization.
- [ ] **Export History:** Save analysis results to `localStorage` or export as CSV.
- [ ] **Custom Dictionaries:** Allow users to add their own keywords for specific domain analysis (e.g., Medical or Legal).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
