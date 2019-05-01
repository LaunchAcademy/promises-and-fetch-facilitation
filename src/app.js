const express = require("express")
const path = require("path")
const logger = require("morgan")
const bodyParser = require("body-parser")
const hbsMiddleware = require("express-handlebars")
const fs = require("fs")
const _ = require("lodash")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "../views"))
app.engine(
  "hbs",
  hbsMiddleware({
    defaultLayout: "default",
    extname: ".hbs"
  })
)
app.set("view engine", "hbs")

app.use(logger("dev"))
app.use(express.json())

app.use(express.static(path.join(__dirname, "../public")))
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is listening...")
})

const booksPath = path.join(__dirname, "../books.json")

const booksJson = () => {
  return JSON.parse(fs.readFileSync(booksPath))
  // retrieve our books fro mthe json file
}

const getNextBookId = () => {
  const books = booksJson()
  const maxBook = _.maxBy(books.books, book => book.id)
  return maxBook.id + 1
}

const updateBooksJsonData = books => {
  const data = { books: books }
  fs.writeFileSync(booksPath, JSON.stringify(data))
}

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/books.json", (req, res) => {
  // debugger
  console.log("Made it to the GET backend")

  res.set({ "Content-Type": "application/json" }).json(booksJson())
  // return a json response that has our books
})

app.post("/books.json", (req, res) => {
  // debugger
  console.log("Made it to the POST backend")
  console.log(req.body.book)

  const book = req.body.book
  let newBook
  // retrieve the book from params

  if (book && book.name) {
    // if as book was sent along in the post request...

    newBook = {
      id: getNextBookId(),
      name: book.name
    }
    // create a new book object that ALSO has a swanky id

    const books = booksJson().books
    // retrieve the books from our JSON. We need to add to them in a moment!

    books.push(newBook)
    // Add our newBook object to the working vanilla JS version of the books

    updateBooksJsonData(books)
    // replace our old books with our vanilla JS version of our books


    console.log("Sending back a book with an id!")
    console.log(newBook)
    res.json({ book: newBook })
    // send back our newly created book, so that it can be added to the DOM
  } else {
    res.send(422).json({ name: ["Can't be blank"] })
    // The user probably didnt add a book! Tell them what they did wrong before they make another post request
  }
})

module.exports = app
