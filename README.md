# 🩺 Sanjeevani: AI-Powered Medical Diagnosis & Health Analysis

Sanjeevani is an AI-powered medical diagnostic system designed to assist healthcare professionals and patients by analyzing medical images and lab reports to detect diseases at an early stage. Built with advanced Machine Learning and Computer Vision techniques, Sanjeevani aims to bridge the gap in healthcare accessibility, especially in underserved regions.

## 🚀 Features

- 🔬 **Image-Based Diagnosis**
  - **Chest X-rays:** Detect Pneumonia & Tuberculosis using CNN models.
  - **MRI Scans:** Identify Brain Tumors.
  - **Skin Images:** Classify Melanoma and other skin conditions.

- 📄 **Medical Report Analysis**
  - Extract text using OCR (Tesseract/Google Vision API).
  - Interpret blood and urine test reports using ML models.

- 📊 Real-time inference with TFLite deployment for mobile accessibility.

- 💬 Interactive dashboard for uploading, analysis, and viewing results.

---

## 🧠 Tech Stack

| Module                 | Technology Used                                |
|------------------------|-----------------------------------------------|
| AI/ML Models           | TensorFlow, Keras (ResNet50, EfficientNet)     |
| OCR                    | Tesseract OCR, Google Vision API               |
| Image Preprocessing    | OpenCV, NumPy                                  |
| UI/UX                  | Streamlit / Flask / React (based on version)   |
| Deployment             | TFLite, Colab API, Firebase / Render           |
| Dataset Sources        | Shenzhen TB X-rays, ISIC Skin Lesion, BraTS    |

---

## 📁 Project Structure

sanjeevani/ │ <br>├── models/ # Trained AI/ML models (H5/TFLite) <br>├── datasets/ # Image datasets (X-ray, MRI, skin)
              <br>├── notebooks/ # Training and evaluation notebooks <br> ├── backend/ # Flask/Django backend for inference 
              <br>├── frontend/ # UI for interaction 
              <br>├── static/ # Icons, CSS, JS files 
              <br>├── utils/ # Helper scripts for preprocessing, OCR 
              <br>└── README.md

![Screenshot 2025-04-06 111319](https://github.com/user-attachments/assets/dc73d543-8ae6-4765-b98e-40291280728f)


---

## 🛠 Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/sanjeevani.git
cd sanjeevani
```

---

2. **Create a virtual environment & install dependencies**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
---

3. **Run the Application**
```bash
python backend/app.py  # Or use Streamlit / Flask depending on your frontend
```

<br><br>
🧪 Sample Results<br>

Input Image	Output Diagnosis<br>
Chest X-ray	✅ Tuberculosis Detected<br>
Brain MRI	⚠️ Possible Tumor Region<br>
Skin Lesion	✅ Likely Benign (Melanoma)<br>
Blood Test (OCR Extracted) 🔍 Elevated WBC Count<br>
AND many more......

<br><br>
💡 Use Cases
Rural Telemedicine & Diagnosis

Public Health Screening Programs

AI Assistance in Primary Healthcare

Mobile Health Apps Integration<br><br>

👨‍💻 Developed By

Sahana G: [🧷LinkedIn](http://www.linkedin.com/in/sahana-g-912979326)
<br> HealthTech Enthusiast • Project Lead

Madhuradarshini : [🧷LinkedIn](http://www.linkedin.com/in/madhuradarshinirm)
<br> Frontend Developer • OCR & Image Processing

Yashashwini R:  [🧷LinkedIn](https://www.linkedin.com/in/yashaswini-r-39a127325)
<br> Backend Developer • Cloud Integrator

Armaan Samir Jena:  [🧷LinkedIn](http://www.linkedin.com/in/jena-armaan)
<br> AI Engineer • AI/ML Developer

<br><br>
📜 License
This project is licensed under the MIT License.<br>
See the LICENSE file for details.

<br><br>
🙏 Acknowledgements
NIH Shenzhen Dataset<br>

ISIC Skin Cancer Dataset<br>

BraTS Brain Tumor Dataset<br>

TensorFlow, Google Cloud, Tesseract OCR<br>
***
