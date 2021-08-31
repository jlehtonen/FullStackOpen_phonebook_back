require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const app = express();

app.use(express.static("build"));
app.use(cors());
app.use(express.json());

morgan.token("payload", (req, res) => {
  if (req.method !== "POST") {
    return "";
  }

  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :payload")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  );
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.post("/api/persons", (req, res) => {
  const person = req.body;

  if (!person.name) {
    return res.status(400).json({ error: "name is required" });
  }

  if (!person.number) {
    return res.status(400).json({ error: "number is required" });
  }

  if (persons.map(p => p.name).includes(person.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });

  newPerson.save().then(savedPerson => {
    res.status(201).json(savedPerson);
  });
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);

  if (!person) {
    return res.status(404).end();
  }

  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndRemove(req.params.id).then(result => {
    res.status(204).end();
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
