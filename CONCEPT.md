# Sanjeevani Project Concept & Structure

## 🩺 Project Concept
**Sanjeevani** is an AI-powered healthcare ecosystem designed to bridge the gap between patients and medical professionals. It leverages Machine Learning and Computer Vision to provide early-stage disease diagnosis and efficient healthcare management.

### Key Capabilities:
1.  **AI-Driven Diagnostics**: 
    -   **Chest X-ray Analysis**: Detection of Pneumonia and Tuberculosis.
    -   **MRI Scan Interpretation**: Identification of Brain Tumors.
    -   **Dermatological Assessment**: Classification of skin conditions like Melanoma.
2.  **Health Management Portal**:
    -   Appointment booking and management.
    -   Secure access to medical records and prescriptions.
    -   Digital consultation platform (Telemedicine).
3.  **Intelligent Symptom Checker**: 
    -   Natural language symptom analysis to provide preliminary advice and doctor redirection.
4.  **Cloud Integration**:
    -   Real-time data storage and authentication using Firebase.

---

## 🏗️ Project Structure (Optimized for Vercel)

The project has been reorganized from a non-standard "folder-per-entry" structure to a standard web structure to ensure compatibility with Vercel and other modern hosting platforms.

```text
sanjeevani/
├── images/                 # UI assets and sample medical images
├── _html/ (Backup)         # Original HTML sources (Preserved)
├── _css/ (Backup)          # Original CSS source (Preserved)
├── _js/ (Backup)           # Original JS source (Preserved)
├── index.html              # Main Entry Point
├── services.html           # Services Dashboard
├── contact.html            # Contact Page
├── bookappointment.html    # Appointment Booking UI
├── consaltation.html       # Consultation Interface
├── consaltationreply.html  # AI Feedback Interface
├── style.css               # Unified Stylesheet
├── script.js               # Main Logic & Interactivity
├── sanjeevani_codes.py     # AI/Backend Research (Colab Export)
├── Sanjeevani_codes.ipynb  # Interactive Notebook
├── requirements.txt        # Python Dependencies
├── vercel.json             # Vercel Deployment Config
└── README.md               # Project Overview
```

---

## 🚀 Vercel Deployment Status
The project is now **Vercel Friendly**. 
- **Static Frontend**: The HTML, CSS, and JS files have been moved to the root to allow Vercel's automatic detection of the `index.html` entry point.
- **Link Integrity**: All internal links, stylesheets, and scripts have been updated to use standardized relative paths.
- **Asset Management**: Images are served correctly from the `images/` directory.
- **Ready for API Scaling**: A `requirements.txt` and `vercel.json` are provided to facilitate future migration of the Python backend to Vercel Serverless Functions.
