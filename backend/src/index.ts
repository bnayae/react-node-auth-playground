// import dependencies
// tslint:disable: radix
// tslint:disable: object-literal-sort-keys
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "express-jwt";
import helmet from "helmet";
import jwksRsa from "jwks-rsa";
import morgan from "morgan";
import { IQuestion } from "./IQuestion";

dotenv.config();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8081;

// define the Express app
const app = express();

// the database
const questions: IQuestion[] = [];

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan("combined"));

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

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
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
app.post("/", checkJwt, (req: any, res: any) => {
  const { title, description } = req.body;
  const newQuestion: IQuestion = {
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
app.post("/answer/:id", checkJwt, (req: any, res: any) => {
  const { answer } = req.body;

  const question = questions.filter(
    (q: any) => q.id === parseInt(req.params.id)
  );
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
