const express = require("express");
const app = express();

const chars = [
  {
    id: 1,
    name: "Captain America",
    userId: 1,
  },
  {
    id: 2,
    name: "Iron Man",
    userId: 2
  }
];

app.get('/chars', function (req, res) {
    res.send(chars);
});

app.get('/chars/:id', function (req, res) {
    res.send(chars.find(char => char.id == req.params.id));
});

app.get('/chars/users/:id', function (req, res) {
    res.send(chars.filter(char => char.userId == req.params.id));
});

app.listen({ port: 4003 }, () =>
  console.log(`Server ready at http://localhost:4003`)
);
