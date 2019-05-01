// // debugger
// fetch('http://localhost:3000/books.json')
//   .then(response => {
//     if (response.ok) {
//       return response;
//     } else {
//       let errorMessage = `${response.status} (${response.statusText})`,
//           error = new Error(errorMessage);
//       throw(error);
//     }
//   })
//   .then(response => response.json())
//   .then(bodyParsed => {
//     // debugger
//
//     let bookList = document.getElementById('books');
//     let booksString = ``;
//     bodyParsed['books'].forEach(book => {
//       booksString += `<li>${book['name']}</li>\n`
//     });
//     bookList.innerHTML = booksString;
//
//   })
//   .catch(error => console.error(`Error in fetch: ${error.message}`));


let data = {
  book: {
    name: 'glittery book from fetch'
  }
};
// create a book object. Normally we would get this from an HTML form
let jsonStringData = JSON.stringify(data);
// change this vanilla JS book to JSON

fetch('http://localhost:3000/books.json', {
  // make an HTTP post request to the backend. An existing URL should already exist
  method: 'post',
  body: jsonStringData,
  headers: new Headers({
    'Content-Type': 'application/json'
  })
  // pass along our new book data!
}).then(response => {
    if (response.ok) {
      return response;
    } else {
      let errorMessage = `${response.status} (${response.statusText})`,
          error = new Error(errorMessage);
      throw(error);
    }
    // general error handling
  })
  .then(response => response.json())
  // make it into vanilla JS again
  .then(bookBody => {
    console.log(bookBody)
    let bookList = document.getElementById('books');
    // grab the element we want to append the new book
    let booksString = `<li>${bookBody.book['name']}</li>\n`
    bookList.innerHTML = booksString;
    // append it in an li on the screen
  })
  .catch(error => console.error(`Error in fetch: ${error.message}`));
