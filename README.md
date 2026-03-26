# AgriNova: AI Agriculture Intelligence Platform 🌿

AgriNova is a full-stack AI-powered farming platform designed to help farmers with **Disease Detection**, **Crop Recommendation**, and **Fertilizer Planning**.

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### 1. Prerequisites
- **Python 3.9+**
- **Node.js 16+**
- **npm** or **yarn**

### 2. Backend Setup (Flask)
1. Navigate to the project root.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. **Important: Large Model File**
   The primary disease detection model (`trained_plant_disease_model.keras`) is too large for GitHub (201MB). 
   - Please download it from [Your Shared Link Here] and place it in the root directory.
   - Alternatively, use the included `.pkl` models for Crop Recommendation and Fertilizer features which work out of the box.
5. Run the server:
   ```bash
   python app.py
   ```

### 3. Frontend Setup (React)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛠 Features

- **Leaf Disease Detection**: Upload an image of a Corn or Potato leaf to get a diagnosis using **EfficientNetB0**.
- **Crop Intelligence**: Enter soil NPK, temperature, and rainfall to get the best crop recommendation via **Random Forest**.
- **Nutrient Planning**: Rule-based fertilizer calculator for specific crops.
- **Premium Dashboard**: Glassmorphic UI with full Dark Mode support.

## 👥 Contributors
- **Om Kamble** (Integration & Documentation)
- **Akash Radhakrishnan** (Backend & Crop Logic)
- **Krishna Yadav** (ML & Computer Vision)
- **Snaket Bihare** (UX/UI & Dashboard)

---
*Developed for MSBTE 6th Semester Micro-Project Submission.*
