# Ledgerly (BiasharaPro) 📊📱

Ledgerly (BiasharaPro) is a responsive, full-stack retail and credit management solution designed for retail storefront operations. It streamlines store credit issuance, tracks customer payment histories, automates outstanding balance monitoring, and generates financial ledger summaries for seamless daily business administration.

---

## 🚀 Key Modules & Capabilities

* **User Authentication Firewall:** A secure admin gateway supporting unified Sign-Up and Sign-In pipelines with customizable requirements (compulsory Name, Password, and Phone fields; optional Email backup mappings).
* **Shop Credit & Debt Dashboard:** An intuitive control panel containing administrative modules to immediately provision and structure customer storefront credit tabs, interest parameters, and target maturity timelines.
* **Customer Account Management Module:** A central client directory handling new client profile registrations and tracking individual outstanding balance totals.
* **Cross-Relational Transaction Logs:** Dedicated individual profile ledger audit lines capturing exact history logs of customer repayments, payment channels, and timestamps.
* **Responsive Layout Architecture:** Tailored fluid components powered by Tailwind CSS grid controls that adapt beautifully to desktop environments, tablets, and small mobile phone displays via mobile drawer navigation toggles.
* **Dynamic Media Preview Panel:** An aesthetic interface configuration setting permitting localized image attachments via integrated file explorer dialogues for immediate profile avatar adjustments.
* **Financial Insights & Report Exports:** A structured, printable asset summary module with tailored document sheets and system print triggers that filter out action menus for paper format reports.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React (Vite-Powered Pipeline)
* **Styling Engine:** Tailwind CSS
* **Iconography Ecosystem:** Lucide React
* **Backend Database & Identity Hosting:** Supabase Cloud Infrastructure (utilizing relational PostgreSQL tables and secure Row-Level Security parameters)

---

## 📁 Repository Directory Structure

```text
Ledgerly/
├── public/
├── src/
│   ├── components/
│   │   ├── CustomerForm.jsx
│   │   ├── CustomerHistoryModal.jsx
│   │   ├── Navbar.jsx
│   │   └── PaymentModal.jsx
│   ├── pages/
│   │   ├── Customers.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   └── Reports.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── supabaseClient.js
├── .env
├── index.html
├── package.json
└── vite.config.js