# SmartHarvest - Crop Management System

A modern web application for crop disease diagnosis and management using image analysis.

## Features

- Image-based crop disease diagnosis
- Real-time analysis and recommendations
- Comprehensive crop health monitoring
- User-friendly interface with drag-and-drop functionality
- Detailed diagnosis reports with confidence scores

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SmartHarvest-crop-management-system.git
cd SmartHarvest-crop-management-system
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

### Running the Application

1. Start the backend server (from the backend directory):
```bash
npm run dev
```
The backend will run on http://localhost:3000

2. Start the frontend development server (from the root directory):
```bash
npm run dev
```
The frontend will run on http://localhost:5173

## Usage

1. Navigate to http://localhost:5173 in your web browser
2. Select the "Diagnose Crop" option from the sidebar
3. Upload images of your crops (supports JPG and PNG formats)
4. Fill in the required information about your crop
5. Click "Start AI Diagnosis" to receive analysis results

## Technical Details

### Frontend
- Vite + JavaScript
- Modern UI with Tailwind CSS
- Real-time image processing
- Interactive data visualization with Chart.js

### Backend
- Node.js + Express
- Image processing with Sharp
- File handling with Multer
- Color-based disease detection algorithm

## Development

The application uses a mock AI system for demonstration purposes. The disease detection is based on color analysis and predefined patterns. In a production environment, this would be replaced with a more sophisticated machine learning model.

### Mock AI Features
- Color pattern analysis for disease detection
- Confidence score calculation
- Predefined disease database
- Simulated processing time for realistic behavior

## License

MIT License - feel free to use this code for your own projects.
