const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "Cannot find user" });
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username );
  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists!" })
  }
  const id = uuidv4()
  const user = {
    id,
    name,
    username,
    todos: []
  }
  users.push(user)
  response.status(201).json(user)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id:uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.json(user.todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const id = request.params.id;
  const index = user.todos.findIndex((todo) => todo.id == id)
  if (index == -1) {
    return response.status(404).json({ error: "Cannot find todo" })
  }
  user.todos[index].title = title
  user.todos[index].deadline = deadline
  response.json(user.todos[index])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const index = user.todos.findIndex((todo) => todo.id == id)
  if (index == -1) {
    return response.status(404).json({ error: "Cannot find todo" })
  }
  const status = user.todos[index].done
  user.todos[index].done = !status;
  response.json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const index = user.todos.findIndex((todo) => todo.id == id)
  if (index == -1) {
    return response.status(404).json({ error: "Cannot find todo" })
  }
  user.todos.splice(index,1);
  return response.status(204).json({})
});

module.exports = app;