# 🎡 PLAYWRIGHT_GPT - AI-Powered Test Automation 🚀  


██████╗ ██╗      █████╗ ██╗   ██╗██╗    ██╗██████╗ ██╗ ██████╗ ██╗  ██╗████████╗               ██████╗ ██████╗ ████████╗
██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██║    ██║██╔══██╗██║██╔════╝ ██║  ██║╚══██╔══╝              ██╔════╝ ██╔══██╗╚══██╔══╝
██████╔╝██║     ███████║ ╚████╔╝ ██║ █╗ ██║██████╔╝██║██║  ███╗███████║   ██║       █████╗    ██║  ███╗██████╔╝   ██║   
██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██║███╗██║██╔══██╗██║██║   ██║██╔══██║   ██║       ╚════╝    ██║   ██║██╔═══╝    ██║   
██║     ███████╗██║  ██║   ██║   ╚███╔███╔╝██║  ██║██║╚██████╔╝██║  ██║   ██║                 ╚██████╔╝██║        ██║   
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝                  ╚═════╝ ╚═╝        ╚═╝   
                                                                                                                        


## 📌 Overview  
**PLAYWRIGHT_GPT** is a next-gen **AI-powered test automation framework** using:
- **[Playwright](https://playwright.dev/)** for end-to-end browser automation  
- **GPT-based locators** to dynamically identify elements for resilient tests  
- **Parallel execution** with multiple workers for efficiency  
- **Data-driven testing** with CSV inputs for flexible test cases  

---

## 🚀 Features  
✅ **Dynamic Locators with GPT** – No hardcoded selectors, AI finds elements  
✅ **Parallel Test Execution** – Runs multiple tests simultaneously for speed  
✅ **Data-Driven Testing** – Uses CSV to drive different user scenarios  
✅ **Caching Strategy** – Avoids unnecessary GPT calls for performance  
✅ **Headless & Headed Mode Support** – Choose between fast execution or debugging  
✅ **Easy GitHub Integration** – Ready for CI/CD  

---

## 🔧 Setup & Installation  

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/rkennedy97/playwrightGPT.git
cd playwrightGPT
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Install Playwright Browsers**
```bash
npx playwright install
```

---

## 🏃 Running Tests  

### **1️⃣ Run All Tests in Parallel**
```bash
npx playwright test --workers=2
```

### **2️⃣ Run a Specific Test**
```bash
npx playwright test tests/GPTTest.spec.ts
```

### **3️⃣ Run Tests in Headless Mode**
```bash
npx playwright test --headed=false
```

---

## 👤 Folder Structure  

```
playwrightGPT/
│── data/                      # Test data (CSV)
│   └── testData.csv
│── prompts/                   # GPT-generated locators
│   ├── gptCache_purchaseFlow.json
│   ├── prompts.json
│── tests/                      # Playwright test specs
│   ├── GPTTest.spec.ts         # Main Playwright test file
│── utilities/Common/           # Reusable utility functions
│   ├── gptLib.ts               # GPT locator cache & helpers
│   ├── commonMethods.ts        # General utility functions
│── playwright.config.ts        # Playwright configuration
│── package.json                # Project dependencies
│── README.md                   # You're reading this!
└── tsconfig.json                # TypeScript configuration
```

---

## 🎯 How It Works  

### **🧠 GPT-Powered Locators**  
Instead of relying on **hardcoded selectors** (CSS/XPath), we let **GPT dynamically identify elements**, making tests more **resilient to UI changes**.

### **⚡ Parallel Execution**
Using:
- `test.describe.parallel()`  
- `workers: 2` in `playwright.config.ts`  

This ensures **fast execution** across multiple tests.

### **📊 Data-Driven Testing**
Tests read user data from **CSV files** (`testData.csv`), allowing **parameterized test cases**.

---

## 📢 Contributing  
We welcome contributions! If you find bugs or have ideas for improvements:
1. **Fork the repository**  
2. **Create a feature branch** (`git checkout -b feature-new-improvement`)  
3. **Commit changes** (`git commit -m "Added feature XYZ"`)  
4. **Push to GitHub and open a Pull Request** 🎉  

---

## 🔧 Future Enhancements  
- ✅ **[Planned] CI/CD Pipeline** (GitHub Actions Integration)  
- ✅ **[Planned] Allure & HTML Test Reporting**  
- ✅ **[Planned] More Test Cases**  

---

## 📝 License  
This project is private and not intended for distribution.
All rights reserved. Unauthorized use, copying, or distribution of this code is prohibited.

---

## 💌 Questions?  
If you have any issues or suggestions, feel free to **open an issue** on GitHub!  

---

