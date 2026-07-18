# ConditionalBlock ⚡

> Programmable conditional payments and smart escrows on the Midnight Network.

ConditionalBlock is a decentralized application (dApp) that enables users to create, manage, and execute programmable escrow contracts. By leveraging the speed and zero-knowledge privacy of the Midnight blockchain, ConditionalBlock allows you to set specific conditions (time, multi-signature approvals, or external oracle data) that must be met before funds are released.

---

## 🔗 Live App
https://conditional-block.vercel.app/

## 🎥 Video

https://github.com/user-attachments/assets/3fa744c5-9ad0-4ec8-9ce2-b409dd064293

---

This project has been validated with real testnet users as part of the Level 5 requirements.

### 👥 Level 6: Production Scaling (53+ Verified Active Users)
As part of the final production readiness phase, we have scaled the platform and validated with over 53 testnet users.

#### Table 1: Verified User Directory (Sample)

| User # | User Name |
| :--- | :--- |
| 1 | Madhav Seth |
| 2 | Mayank Dixit |
| 3 | Harsh Kaushik |
| 4 | Md Athar Sharif |
| 5 | Nandita |
| 6 | Mayank Dewangan |
| 7 | PRIYANSHU PANDA |
| 8 | Rajvardhan Chhugani |
| 9 | Rupesh Kumar Sahu |
| 10 | Yogendra Kumar Narmada |
| 11 | Shubham Kumar Khare |
| 12 | Shubham Kumar Sahu |
| 13 | Aaditya Soni |
| 14 | SHLOK RAHA |
| 15 | SAYAN DEBNATH |
| 16 | SHREYANSH SHEKHAR |
| 17 | ABHIRAJ MISHRA |
| 18 | Ayush Kumar Singh |
| 19 | Ankesh Kumar |
| 20 | Prakhar Kumar Mishra |
| 21 | TIZIL ANTHONY EKKA |
| 22 | Nikhil kumar |
| 23 | PAKHI SAHU |
| 24 | NEHA |
| 25 | Aniket Kumar Singh |
| *(Showing top 25 out of 53 active users)* |

### 📊 Feedback Documentation & Implementation
| **[📊 View Live Google Form Responses Sheet](https://docs.google.com/spreadsheets/d/1SATPrhJiX6mnCNiGYwmHkrTFR31Rca-eoK02GfVTAXU/edit?usp=sharing)**

User feedback was collected through two channels to maximize user convenience: directly via our native in-app feedback UI and externally through our Official Google Form. 

| User Name | User Email | User Feedback | Commit ID |
| :--- | :--- | :--- | :--- |
| Madhav Seth | madhav24100@iiitnr.edu.in | Requested a proper dashboard with platform metrics and dynamic transaction cards. | [`2fcf82e`](#) (feat: add dashboard, metrics, and monitoring views to App.tsx) |
| Mayank Dixit | mayank24100@iiitnr.edu.in | Needed better state management for tracking the deployed escrow contract logic and unlocking. | [`9eace35`](#) (feat: add midnight service for contract deployment, state management) |
| Harsh Kaushik | harsh.kaushik10b@gmail.com | Raised concerns about wallet integration and requested direct support for Midnight extensions. | [`a2ca751`](#) (feat: add walletService for Midnight network integration and key derivation) |
| Md Athar Sharif | md24100@iiitnr.edu.in | Asked for robust CI/CD and deployment checks so code builds reliably. | [`821dd18`](#) (feat: add GitHub Actions CI/CD workflow for build and test automation) |
| Nandita | nanditasahu141004@gmail.com | Reported the need for the escrow protocol to fully integrate with the user interface. | [`78fc8ca`](#) (feat: implement Midnight escrow service and integrate contract interaction) |

### 🚀 Future Roadmap & Evolution
Based on the collected user feedback and observations during the Level 5 validation phase, we plan to implement the following improvements in the next development cycle:

1. **Enhanced Input Validation:** Expand on the visual amount validation to include real-time fee estimations and balance checks before transaction submission. 
2. **Localization & Timezones:** Build upon the localized countdown timer to allow users to select their preferred timezone when creating time-bound contracts.
3. **Inline Tutorials:** Create a guided walkthrough for first-time users, specifically focusing on complex features like "Oracle Data" and "Multi-signature setup".
4. **Improved Error Handling:** Implement a more robust error recovery system with descriptive, user-friendly messages for transaction failures. 

---

As part of the final Demo Day preparations, the following production-readiness features have been implemented:

### 1. Advanced Features 🌟
ConditionalBlock highlights two core advanced features:
- **Zero-Knowledge Privacy**: Contract conditions and asset locking are managed natively using Midnight's privacy-preserving smart contract capabilities.
- **Conditional Logic**: Approval-based contracts enforce rules natively on the Midnight network before executing a payload, ensuring true trustless multi-party escrow.

### 2. Live Metrics & Monitoring Dashboard 📊
The platform features an active internal metrics dashboard (DAU, transactions, retention) and an infrastructure monitoring dashboard (System health, DB latency, Worker status).
- **Metrics Dashboard:** <img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/2afa83f7-d5c1-4e0e-830f-068f1ed14020" />
- **Monitoring Dashboard:**<img width="1902" height="845" alt="image" src="https://github.com/user-attachments/assets/8498968c-36b7-458c-9eb4-ab3d3f2b1c7d" />

### 3. Data Indexing 🗃️
Implemented robust data indexing for smart contracts via our backend using Supabase PostgreSQL.
- **Approach:** Contracts are indexed with strict sorting (`created_at`), pagination, and search capabilities (`ilike` on title/description) to guarantee fast read performance.
- **Endpoint:** `GET /api/indexing/contracts?page=1&limit=10&search=escrow`

### 4. Security & Audits 🔒
Completed a thorough security review of the application's auth flow, transaction builder, and data models.
- **[View the Security Checklist (SECURITY.md)](SECURITY.md)**

### 5. Community Contribution 🌍
- **Twitter Post:** https://x.com/RajkumarSh18704/status/2048349207099253028?s=20

---

## ✨ Key Features

- **Lace Wallet Integration**: Secure, seamless one-click login and transaction signing using the official Lace extension.
- **Smart Contract Conditions**:
  - ⏱️ **Time-based**: Funds are locked until a specific date and time.
  - 👥 **Approval-based**: Require designated signers to approve the payment before release.
  - 🔮 **Oracle-based**: Triggers payment release based on external real-world data (e.g., asset prices hitting a target).
- **Zero-Knowledge Privacy**: Escrow logic executed via Midnight Network's ZK circuits to guarantee confidentiality.
- **Modern UI/UX**: A vibrant, glassmorphic design system tailored for a premium user experience.
- **Responsive Design**: Fully optimized for both desktop and mobile web experiences.
- **Persistent Cloud Data**: Fast and reliable backend using Supabase (PostgreSQL).

---

## 📸 UI Screenshots

### Desktop Experience
<!-- PLACEHOLDER: Insert desktop screenshots here -->
<p align="center">
  <img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/4becb0dd-cf28-4293-834c-b65820948ea1" />
  <img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/70773366-e02e-45c7-894c-52276b3591ce" />
</p>

### Mobile Experience
<!-- PLACEHOLDER: Insert mobile screenshots here -->
<p align="center">
  <img width="30%" alt="image" src="https://github.com/user-attachments/assets/74cd9461-c3fa-47ef-9c76-ad0769fe5299" /> <img width="30%" alt="image" src="https://github.com/user-attachments/assets/96fa56a6-ab46-46ac-8bc9-757d33c3230e" />
</p>

---

## 🏗️ Architecture

*For a detailed system design and security overview, please see the [Architecture Document](ARCHITECTURE.md).*

```text
┌─────────────────────────────────────────────────┐
│                 USER (Lace Wallet)              │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│              React Frontend (Vite)              │
│       Dashboard · Create Escrow · Details       │
└────────────────────┬────────────────────────────┘
                     │ REST API / Compact ZK
                     ▼
┌─────────────────────────────────────────────────┐
│              Node.js Backend (Express)          │
│       Auth · Contract Services · Monitor        │
└────────────────────┬────────────────────────────┘
                     │ Data    │ Tx Submission
                     ▼         ▼
┌──────────────────────┐  ┌───────────────────────┐
│ Supabase (PostgreSQL)│  │ Midnight Testnet      │
│ Contracts & Signers  │  │ Proof Server          │
└──────────────────────┘  └───────────────────────┘
```

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- React Router
- Vanilla CSS (Glassmorphism, custom responsive design)
- `@midnight-ntwrk/wallet-sdk` & `@midnight-ntwrk/dapp-connector-api`
- Deployed on **Vercel**

**Backend:**
- Node.js & Express
- Supabase (PostgreSQL)
- Deployed on **Render**

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Lace Wallet browser extension
- Local Midnight Proof Server (Docker)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ConditionalBlock.git
cd ConditionalBlock
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the MIT License.
