# SmartHarvest - Crop Management System

A modern, full-stack crop management system with features for managing crops, livestock, and an AI-powered smart assistant.

## Live Demo

Visit the live demo at: [SmartHarvest Landing Page](https://mooncakeSG.github.io/SmartHarvest-crop-management-system/)

## Features

- **Crop & Livestock Management**
  - Track crop growth and health
  - Monitor livestock
  - Manage farm resources
  - Weather integration

- **Smart Assistant**
  - AI-powered chatbot
  - Multilingual support
  - Real-time farm advice
  - Disease detection

## Tech Stack

- Frontend: HTML, Tailwind CSS, JavaScript
- Backend: Flask (Python)
- Database: PostgreSQL
- AI/ML: TensorFlow, OpenCV

## Development

1. Clone the repository:
```bash
git clone https://github.com/mooncakeSG/SmartHarvest-crop-management-system.git
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the chatbot service:
```bash
cd chatbot
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

4. Run the services:
```bash
# Backend (in backend directory)
flask run

# Chatbot (in chatbot directory)
flask run --port 5001
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Developed by Keawin Koesnel – 2025
