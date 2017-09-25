var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require('method-override');

mongoose.connect("mongodb://localhost/todo_app");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride('_method'));

var todoSchema = new mongoose.Schema({
  name: String,
  client: {
        id: { type: mongoose.Schema.Types.ObjectId,
              ref: "Client"},
        name: String,
        clientType: String
          },
  priority: String,
  createAt: {type: Date, default: Date.now },
  dateDelivery: {type: Date, default: Date.now },
  dateEndProcess:  {type: Date, default: Date.now },
  office: String,
  comments: String,
  createUser: String,
  assignUser: String,
  processType: String,
  state: String
});

var clientSchema = new mongoose.Schema({
  name: String,
  clientType: String
});

// var userSchema = new mongoose.Schema({
//   username: String,
//   firstname: String,
//   lastname: String,
//   office: {
//             id: { type: mongoose.Schema.Types.ObjectId,
//                   ref: "Office" },
//             name: String
//               }
// });

// var officeSchema = new mongoose.Schema({
//   name: String
// });

var Todo = mongoose.model("Todo", todoSchema);
var Client = mongoose.model("Client", clientSchema);
// var User = mongoose.model("User", userSchema);
// var Office = mongoose.model("Office", officeSchema);

app.get("/", function(req, res){
  res.redirect("/todos");
});

// function to be used in the .get("/todos"..) route
function escapeRegex(name) {
    return name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.get("/todos", function(req, res){
  if(req.query.keyword) {
    const regex = new RegExp(escapeRegex(req.query.keyword), 'gi');
    Todo.find({ name: regex }, function(err, todos){
      if(err){
        console.log(err);
      } else {
        res.json(todos);
      }
    });
  } else {
    Todo.find({}, function(err, todos){
      if(err){
        console.log(err);
      } else {
        if(req.xhr) {
          res.json(todos);
        } else {
          res.render("index", {todos: todos});
        }
      }
    });
  }
});

app.get("/todos/new", function(req, res){
 res.render("new");
});

app.post("/todos", function(req, res){
 req.body.todo.name = req.sanitize(req.body.todo.name);
 var formData = req.body.todo;
 var clienData = {
   name : formData.client,
   clientType : formData.clientType
 }
 Client.create(clienData, function(err, newClient){
   if(err){
      console.log(err);
   } else {
      formData.client = {
          id : newClient._id,
          name : newClient.name,
          clientType : newClient.clientType
      }
      console.log('Crear TODO');
      console.log('FormData');
      console.log(formData);
      console.log('newClient');
      console.log(newClient);
      Todo.create(formData, function(err, newTodo){
         if(err){
           res.render("new");
         } else {
           console.log('Nuevo TOdo');
           console.log(newTodo);
           res.json(newTodo);
         }
      });
  }
 });
});

app.get("/todos/:id", function(req, res){
console.log(req.params.id);
 Todo.findById(req.params.id, function(err, todo){
   if(err){
     console.log(err);
     res.redirect("/")
   } else {
     console.log("Busca un todo");
     console.log(todo);
      if(req.xhr) {
        res.json(todo);
      } else {
        res.render("edit", {todo: todo});
      }
   }
 });
});

app.put("/todos/:id", function(req, res){
 Todo.findByIdAndUpdate(req.params.id, req.body.todo, {new: true}, function(err, todo){
   if(err){
     console.log(err);
   } else {
      res.json(todo);
   }
 });
});

app.delete("/todos/:id", function(req, res){
 Todo.findByIdAndRemove(req.params.id, function(err, todo){
   if(err){
     console.log(err);
   } else {
      res.json(todo);
   }
 });
});

//Conexion a Cloud9
// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log('The server has started ..');
// });

app.listen(3000, function() {
  console.log('Server running on port 3000');
});
