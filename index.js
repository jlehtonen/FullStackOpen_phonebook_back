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

app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then(numPersons => {
      res.send(
        `<p>Phonebook has info for ${numPersons} people</p><p>${new Date()}</p>`
      );
    })
    .catch(error => next(error));
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons);
    })
    .catch(error => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const person = req.body;

  if (!person.name) {
    return res.status(400).json({ error: "name is required" });
  }

  if (!person.number) {
    return res.status(400).json({ error: "number is required" });
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });

  newPerson
    .save()
    .then(savedPerson => {
      res.status(201).json(savedPerson);
    })
    .catch(error => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const person = req.body;

  if (!person.name) {
    return res.status(400).json({ error: "name is required" });
  }

  if (!person.number) {
    return res.status(400).json({ error: "number is required" });
  }

  const newPerson = {
    name: person.name,
    number: person.number,
  };

  Person.findByIdAndUpdate(req.params.id, newPerson, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
