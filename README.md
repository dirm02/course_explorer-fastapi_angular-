# Full-Stack Course Management Application using FastAPI and Angular

This project is a full-stack application built with FastAPI for the backend and Angular for the frontend. It allows users to manage courses, including features for creating, updating, deleting, and fetching courses, as well as searching courses and fetching category data.

1. **Project Structure**: The structure gives a clear overview of how the project is organized, including both backend and frontend directories.
2. **Setup and Installation**: Instructions for setting up both the backend and frontend, including cloning the repository, creating a virtual environment, installing dependencies, and configuring environment variables.
3. **Running the Application**: Steps to start MongoDB, run the FastAPI application, and run the Angular application.
4. **API Endpoints**: Lists the available API endpoints with brief descriptions.
5. **Deployment**: Instructions for deploying the entire application using Docker and Docker Compose.
6. **Contributing**: Guidelines for contributing to the project.
7. **License**: Information about the project's license.

## Project Structure

```
course-management-app/
├── backend/
│ ├── app/
│ │ ├── init.py
│ │ ├── main.py
│ │ ├── data_handler.py
│ │ ├── models.py
│ │ └── routes/
│ │ ├── init.py
│ │ ├── courses.py
│ │ └── categories.py
│ ├── .env
│ ├── .gitignore
│ ├── requirements.txt
│ ├── Dockerfile
│ └── docker-compose.yml
├── frontend/
│ ├── src/
│ │ ├── app/
│ │ │ ├── components/
│ │ │ ├── services/
│ │ │ ├── app.module.ts
│ │ │ ├── app.component.ts
│ │ │ └── app.component.html
│ ├── angular.json
│ ├── package.json
│ ├── tsconfig.json
│ └── .gitignore
├── .gitignore
├── README.md
└── docker-compose.yml
```

- **backend/**: Contains the backend application code.
  - **app/**: Contains the FastAPI application code.
    - **main.py**: Entry point of the application.
    - **data_handler.py**: Functions for data handling and database interactions.
    - **models.py**: Defines Pydantic models for data validation.
    - **routes/**: API route definitions.
      - **courses.py**: API routes for course management.
      - **categories.py**: API routes for category management.
  - **.env**: Environment variables for configuration.
  - **requirements.txt**: Project dependencies.
  - **Dockerfile**: Dockerfile for building the Docker image.
  - **docker-compose.yml**: Docker Compose configuration for the backend.
- **frontend/**: Contains the frontend Angular application code.
  - **src/**: Source code for the Angular application.
    - **app/**: Main application code.
      - **components/**: Angular components.
      - **services/**: Angular services for API calls.
      - **app.module.ts**: Main Angular module.
      - **app.component.ts**: Main Angular component.
      - **app.component.html**: Main Angular template.
  - **angular.json**: Angular configuration.
  - **package.json**: Project dependencies.
  - **tsconfig.json**: TypeScript configuration.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **README.md**: This readme file.
- **docker-compose.yml**: Docker Compose configuration for the entire project.

## Setup and Installation

### Prerequisites

- Python 3.8+
- MongoDB
- Docker (for containerization)
- Docker Compose (for setting up the development environment)

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. **Install the dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file with the following content:**

   ```
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=courses_db
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

### Running the Application

#### Backend

1. **Start MongoDB:**

   Ensure MongoDB is running on your local machine or adjust the `MONGODB_URI` in the `.env` file to point to your MongoDB instance.

2. **Run the FastAPI application:**

   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`.

#### Frontend

1. **Navigate to the frontend directory (if not already there):**

   ```bash
   cd frontend
   ```

2. **Run the Angular application:**

   ```bash
   ng serve
   ```

   The frontend will be available at `http://localhost:4200`.

## API Endpoints

### Courses

- **GET /courses/**: Fetch all courses with pagination and search functionality.
- **POST /courses/**: Create a new course.
- **PUT /courses/{course_id}**: Update an existing course.
- **DELETE /courses/{course_id}**: Delete a course.

### Categories

- **GET /categories/{category}**: Fetch all entries for a specific category (e.g., universities, cities).

## Deployment

### Using Docker

1. **Build the Docker image:**

   ```bash
   docker-compose build
   ```

2. **Run the Docker container:**

   ```bash
   docker-compose up -d
   ```

   The backend API will be available at `http://127.0.0.1:8000` and the frontend at `http://localhost:4200`.

### Using Docker Compose

1. **Create a `docker-compose.yml` file:**

   ```yaml
   version: '3.8'

   services:
     backend:
       build: ./backend
       container_name: backend
       ports:
         - "8000:8000"
       env_file:
         - ./backend/.env
       depends_on:
         - mongodb

     frontend:
       build: ./frontend
       container_name: frontend
       ports:
         - "4200:4200"
       depends_on:
         - backend

     mongodb:
       image: mongo
       container_name: mongodb
       ports:
         - "27017:27017"
   ```

2. **Start the application using Docker Compose:**

   ```bash
   docker-compose up -d
   ```

   The backend API will be available at `http://127.0.0.1:8000` and the frontend at `http://localhost:4200`.

To show my expertise in deploying, I deployed backend using ngrok and frontend using heroku.
So you can visit the website using the [URL]().

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.