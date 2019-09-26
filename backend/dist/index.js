"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import dependencies
// tslint:disable: radix
// tslint:disable: object-literal-sort-keys
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const helmet_1 = __importDefault(require("helmet"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8081;
// define the Express app
const app = express_1.default();
// the database
const questions = [];
// enhance your app security with Helmet
app.use(helmet_1.default());
// use bodyParser to parse application/json content-type
app.use(body_parser_1.default.json());
// enable all CORS requests
app.use(cors_1.default());
// log HTTP requests
app.use(morgan_1.default("combined"));
// retrieve all questions
app.get("/", (req, res) => {
    const qs = questions.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        answers: q.answers.length
    }));
    res.send(qs);
});
app.get("/health", (req, res) => {
    res.send(`healthy at ${new Date()}`);
});
app.get("/geadiness", (req, res) => {
    res.send(`ready at ${new Date()}`);
});
app.get("/metrics/heartbeat", (req, res) => {
    res.send(1);
});
// get a specific question
app.get("/:id", (req, res) => {
    const question = questions.filter((q) => q.id === parseInt(req.params.id));
    if (question.length > 1) {
        return res.status(500).send();
    }
    if (question.length === 0) {
        return res.status(404).send();
    }
    res.send(question[0]);
});
const checkJwt = express_jwt_1.default({
    secret: jwks_rsa_1.default.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    // Validate the audience and the issuer.
    audience: process.env.AUTH0_CLIENT_ID,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ["RS256"]
});
// insert a new question
app.post("/", checkJwt, (req, res) => {
    const { title, description } = req.body;
    const newQuestion = {
        id: questions.length + 1,
        title,
        description,
        answers: [],
        author: req.user.name
    };
    questions.push(newQuestion);
    res.status(200).send();
});
// insert a new answer to a question
app.post("/answer/:id", checkJwt, (req, res) => {
    const { answer } = req.body;
    const question = questions.filter((q) => q.id === parseInt(req.params.id));
    if (question.length > 1) {
        return res.status(500).send();
    }
    if (question.length === 0) {
        return res.status(404).send();
    }
    question[0].answers.push({
        answer,
        author: req.user.name
    });
    res.status(200).send();
});
// start the server
app.listen(PORT, () => {
    // tslint:disable-next-line: no-console
    console.log(`listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map