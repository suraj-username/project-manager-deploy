Project Tracking
A robust, full-stack collaborative workspace designed for agile teams. This system goes beyond simple CRUD operations by implementing a strict Workflow Engine based on behavioral design patterns. It features granular Role-Based Access Control (RBAC), hierarchical task management, and a secure, session-persistent authentication flow.

Live DemoFrontend (Client): https://your-project-client.vercel.appBackend 
(API): https://your-project-server.onrender.com

System ArchitectureThe application is built on a decoupled, service-oriented architecture using the MERN Stack (MongoDB, Express, React, Node.js). It utilizes a monorepo structure for streamlined development.Design Patterns ImplementedUnlike standard task managers, this system enforces business logic through established software design patterns:State Design Pattern: Manages the lifecycle of a task (Pending $\rightarrow$ To Do $\rightarrow$ In Progress $\rightarrow$ Done). This encapsulates transition logic, ensuring, for example, that a task cannot move to "In Progress" without an assignee.Factory Pattern: Dynamically instantiates the correct State object based on the task's current status string.Singleton Pattern: Ensures a single, efficient database connection instance across the application lifecycle.Middleware Pattern: Handles cross-cutting concerns such as CORS, Authentication, and RBAC authorization chains.
Key Features Security & AuthenticationGoogle OAuth 2.0: Secure, password-less login flow using Passport.js.Session Persistence: Utilizes connect-mongo to store authenticated sessions in MongoDB, ensuring users stay logged in even across server restarts (stateless deployment compatible).JWT Authorization: API requests are secured via JSON Web Tokens.👥 Role-Based Access Control (RBAC)Project Creator (Admin):Exclusive rights to approve tasks from "Pending" to "To Do".Ability to manage team composition and modify project meta-data.Priority escalation privileges.Team Member:Can propose tasks (default to Pending).Can execute tasks and move them through the workflow.Cannot delete projects or approve their own suggestions.📋 Task ManagementHierarchical Data: Tasks support recursive sub-tasking for granular work breakdown.Kanban Workflow: Drag-and-drop interface restricted by backend state validation.Priority Levels: Visual indicators for Low, Medium, and High priority items.🛠 Tech StackComponentTechnologyDescriptionFrontendReact.js (Vite)Component-based UI, React Router for navigation.BackendNode.js / ExpressRESTful API, Middleware architecture.DatabaseMongoDB / MongooseNoSQL document store, Schema validation.AuthPassport.js / JWTOAuth strategies and token management.DevOpsVercel & RenderCI/CD automated deployments.⚙️ Local Development SetupFollow these steps to run the application locally.PrerequisitesNode.js (v18+)MongoDB Atlas Connection StringGoogle Cloud Console Project (Client ID & Secret)1. Clone the RepositoryBashgit clone https://github.com/your-username/project-manager.git
cd project-manager-deploy
2. Backend Setup
Navigate to the server directory and install dependencies.Bash
cd server
npm install
Create a .env file in the /server directory:Code snippet
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
Start the backend server:Bashnpm run dev
3. Frontend SetupOpen a new terminal and navigate to the client directory.Bashcd client
npm install
Create a .env file in the /client directory:Code snippetVITE_API_URL=http://localhost:3000
Start the React development server:Bashnpm run dev
Access the application at http://localhost:5173.🚀 Deployment GuideFrontend (Vercel)Connect repository to Vercel.Set Root Directory to client.Set Output Directory to dist.Add Environment Variable: VITE_API_URL (Pointer to live Render backend).Add vercel.json for client-side routing rewrites.Backend (Render)Create a Web Service connected to the repo.Set Root Directory to server.Add all Environment Variables from the backend setup (MONGO_URI, GOOGLE_CLIENT_ID, etc.).Crucial: Set FRONTEND_URL to the Vercel domain.
