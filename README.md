# Swd392Client

A web application designed to manage seller profiles, product listings, orders, and notifications efficiently.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Docker Setup](#docker-setup)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
This project is a comprehensive platform built using Angular that allows sellers to manage their products, handle orders, and interact with customers. The application includes features like payment callbacks, email verification, order history tracking, and a seller dashboard.

## Features
- **User Management**: Seller profile updates, email verification, and secure login.
- **Product Listings**: Add, edit, and delete product listings.
- **Order Management**: Place orders, update order status, and view order history.
- **Notifications**: Real-time notifications for sellers and customers.
- **Responsive UI**: Optimized for desktop and mobile views.
- **Dockerized Deployment**: Simplified deployment using Docker.

## Tech Stack
- **Frontend**: Angular, TypeScript
- **Backend**: Node.js (API), Docker, Nginx
- **Database**: PostgreSQL (configured separately)
- **Other Tools**: Docker Compose, VS Code

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.io/cli)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/phatnttse/swd392-client.git
   cd swd392-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   ng build
   ```

## Configuration
- Update environment variables in the `.env` file for connecting to external services like email verification, payment APIs, and database configurations.
- Adjust settings in `angular.json` for build and deployment settings.

## Usage
To run the application locally:
```bash
ng serve
```
Visit `http://localhost:4200` to access the application.

## Docker Setup

### Build and Run
Ensure Docker and Docker Compose are installed. Then run:
```bash
docker-compose up --build
```

### Files
- **DockerfileAngular**: Handles Angular app build and deployment.
- **docker-compose.yaml**: Manages multi-container setup including frontend, backend, and Nginx.
- **nginx.conf**: Nginx configuration for serving the Angular app.

## File Structure
```
.vscode/                 # VS Code configuration files
.editorconfig            # Editor settings
.gitignore               # Git ignore rules
DockerfileAngular        # Dockerfile for Angular app
docker-compose.yaml      # Docker Compose configuration
public/                  # Static assets
src/                     # Source code (components, services, etc.)
├── app/                 # Main application module
├── assets/              # Images, icons, etc.
├── environments/        # Environment-specific configurations
├── pages/               # Contact page, dashboard, etc.
angular.json             # Angular CLI configuration
package.json             # Project dependencies
tsconfig.json            # TypeScript configuration
nginx.conf               # Nginx configuration for production
```

## Contributing
Contributions are welcome! Please follow the guidelines below:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License.

---

Feel free to expand on sections like installation, configuration, and usage if your project has more specific requirements or additional setup steps.
