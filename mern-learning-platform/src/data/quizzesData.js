// mern-learning-platform/src/data/quizzesData.js

export const quizzesData = {
  1: {
    moduleTitle: 'Module 1: The Big Picture of MERN',
    questions: [
      {
        id: 'q1-1',
        question: 'In the MERN stack, what is the primary role of React?',
        options: [
          'To query the MongoDB database directly from the browser',
          'To build dynamic, responsive user interfaces and manage client-side state',
          'To listen on server network ports and handle CORS headers',
          'To hash user passwords before storing them in the filesystem'
        ],
        correctAnswer: 1,
        explanation: 'React executes strictly in the user browser, rendering interactive UI components and dispatching HTTP requests to Express.'
      },
      {
        id: 'q1-2',
        question: 'Why do we need Node.js in the MERN stack?',
        options: [
          'Because browsers can only run Python',
          'To provide a server-side JavaScript runtime environment with filesystem and network socket access',
          'To serve as a relational SQL database',
          'To compile HTML into CSS'
        ],
        correctAnswer: 1,
        explanation: 'Node.js allows JavaScript to run on the server, powering Express web servers and database operations.'
      },
      {
        id: 'q1-3',
        question: 'What is the correct journey of a request in a MERN application?',
        options: [
          'User → MongoDB → React → Express → Controller',
          'User → React → Axios → Express Router → Middleware → Controller → Service → Mongoose → MongoDB',
          'React → MongoDB → Express → Node',
          'Axios → React → Mongoose → Middleware → Express'
        ],
        correctAnswer: 1,
        explanation: 'Requests flow downstream from UI to network client, web router, middleware guards, controller transport, business services, and database ODM.'
      }
    ]
  },
  2: {
    moduleTitle: 'Module 2: Project Folder Structure',
    questions: [
      {
        id: 'q2-1',
        question: 'Why do we separate Express routes and controllers into distinct folders?',
        options: [
          'Because JavaScript limits files to 50 lines of code',
          'To separate URL mapping and middleware binding from request/response handling logic (Single Responsibility Principle)',
          'Because MongoDB requires routes and controllers to be in separate folders',
          'To make the application run faster in production'
        ],
        correctAnswer: 1,
        explanation: 'Routes map HTTP methods and paths; controllers handle req/res serialization. Decoupling them keeps code clean, testable, and maintainable.'
      },
      {
        id: 'q2-2',
        question: 'In PriceRadar, where does the core 4-hour background monitoring logic live?',
        options: [
          'client/src/components/Navbar.jsx',
          'server/src/services/priceMonitor.js',
          'worker/requirements.txt',
          'server/src/models/User.js'
        ],
        correctAnswer: 1,
        explanation: 'priceMonitor.js in server/src/services/ houses the distributed locking, offer fetching, and alert evaluation logic.'
      }
    ]
  },
  5: {
    moduleTitle: 'Module 5: Axios Communication',
    questions: [
      {
        id: 'q5-1',
        question: 'What is the primary benefit of using an Axios Request Interceptor in PriceRadar?',
        options: [
          'It deletes the database whenever a request fails',
          'It automatically reads the JWT token from localStorage and attaches Authorization: Bearer <token> to every outgoing request',
          'It compiles JSX into HTML in the browser',
          'It increases network download speeds by 50%'
        ],
        correctAnswer: 1,
        explanation: 'Axios request interceptors run before any request leaves the browser, centralizing token attachment and avoiding duplicate code in every page.'
      },
      {
        id: 'q5-2',
        question: 'What does the unwrap() helper function do in client/src/services/api.js?',
        options: [
          'Extracts res.data.data so callers receive the domain payload directly',
          'Unzips uploaded ZIP files',
          'Decrypts encrypted database strings',
          'Converts paise into dollars'
        ],
        correctAnswer: 0,
        explanation: 'PriceRadar wraps responses in { success: true, data: {...} }. unwrap() returns res.data.data so React components receive clean domain objects directly.'
      }
    ]
  },
  7: {
    moduleTitle: 'Module 7: Express.js Architecture',
    questions: [
      {
        id: 'q7-1',
        question: 'Why should error-handling middleware (with 4 parameters: err, req, res, next) be mounted last in app.js?',
        options: [
          'Because Express only looks at the bottom line of code',
          'So it can catch errors passed down from any preceding route, controller, or middleware in the pipeline',
          'To make sure it executes before CORS headers are set',
          'It does not matter where it is placed'
        ],
        correctAnswer: 1,
        explanation: 'Express routes execute sequentially. Error middleware must be last so any next(err) call in preceding routes flows directly into it.'
      }
    ]
  },
  10: {
    moduleTitle: 'Module 10: JWT & Authentication',
    questions: [
      {
        id: 'q10-1',
        question: 'Is a signed JSON Web Token (JWT) encrypted by default?',
        options: [
          'Yes, nobody on the internet can read what is inside a JWT payload',
          'No! The payload is only Base64Url encoded; anyone can decode and read it. The signature only guarantees integrity.',
          'Yes, it is encrypted with AES-256 by the browser',
          'Only if stored in a cookie'
        ],
        correctAnswer: 1,
        explanation: 'Crucial interview fact: Standard signed JWTs are NOT encrypted. You should never store plaintext passwords or credit card numbers in a JWT payload.'
      },
      {
        id: 'q10-2',
        question: 'Why does PriceRadar configure select: false on User.passwordHash in Mongoose?',
        options: [
          'Because passwords are not stored in MongoDB',
          'To prevent accidental leakage of password hashes if someone calls User.find() or serializes users to JSON',
          'To save RAM during database queries',
          'Because bcrypt does not work with Mongoose'
        ],
        correctAnswer: 1,
        explanation: 'select: false guarantees that standard queries omit the passwordHash unless explicitly requested with .select("+passwordHash") during login.'
      }
    ]
  },
  11: {
    moduleTitle: 'Module 11: MongoDB & Mongoose Modeling',
    questions: [
      {
        id: 'q11-1',
        question: 'Why does PriceRadar store all prices as integers in paise rather than decimal rupees?',
        options: [
          'Because MongoDB does not support decimal numbers',
          'To eliminate IEEE 754 binary floating-point precision errors (like 0.1 + 0.2 !== 0.3) during price drop calculations',
          'Because rupees are illegal in programming',
          'To make database documents smaller'
        ],
        correctAnswer: 1,
        explanation: 'JavaScript floating-point arithmetic introduces fractional errors. Integer paise math (₹5,000 = 500000 paise) guarantees 100% financial accuracy.'
      },
      {
        id: 'q11-2',
        question: 'What happens when a document in OtpChallenge reaches its expiresAt date?',
        options: [
          'The server crashes',
          'MongoDB native background TTL index automatically deletes the document',
          'The user password is deleted',
          'Nothing happens until a manual SQL query is executed'
        ],
        correctAnswer: 1,
        explanation: 'The TTL index { expires: 0 } on expiresAt instructs MongoDB background threads to purge expired OTPs automatically.'
      }
    ]
  },
  15: {
    moduleTitle: 'Module 15: Background Monitoring & GitHub Actions',
    questions: [
      {
        id: 'q15-1',
        question: 'Why does PriceRadar use GitHub Actions to trigger price monitoring every 4 hours instead of relying solely on an internal Node.js setInterval?',
        options: [
          'Because GitHub Actions is cheaper than JavaScript',
          'Because free-tier cloud containers (Render) spin down after 15 minutes of inactivity, terminating internal timers',
          'Because Express cannot execute loops',
          'Because MongoDB requires GitHub Actions to run'
        ],
        correctAnswer: 1,
        explanation: 'When Render containers sleep, internal timers freeze. GitHub Actions acts as an external chronometer that wakes Render via /api/health and triggers the cycle.'
      },
      {
        id: 'q15-2',
        question: 'Why does POST /api/monitor/run return HTTP 202 Accepted instead of HTTP 200 OK?',
        options: [
          'Because 202 means error in HTTP specification',
          'Because price fetching takes 30-90 seconds; returning 202 Accepted immediately decouples triggering from asynchronous background execution and avoids timeouts',
          'Because Render requires 202 codes for all POST requests',
          'To inform the user that their password was accepted'
        ],
        correctAnswer: 1,
        explanation: 'HTTP 202 Accepted acknowledges receipt for asynchronous background processing while GitHub Actions polls status every 10 seconds.'
      }
    ]
  }
};

export const QUIZZES = quizzesData;
export default quizzesData;

