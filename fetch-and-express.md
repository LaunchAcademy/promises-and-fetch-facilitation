## Learning Objectives

* Use the JavaScript `fetch` function in web application

## Intro: Evolution of Asynchronous Programming in JS

**AJAX** revolutionized the expectations of users on the web allowing for a much more rich and seamless user experience.  

AJAX = Asynchronous JavaScript And XML.

AJAX is not a programming language.

AJAX just uses a combination of:  

* A browser built-in XMLHttpRequest object (to request data from a web server)
* JavaScript and HTML DOM (to display or use the data)  

AJAX is a misleading name. AJAX applications might use XML to transport data, but it is equally common to transport data as plain text or JSON.

AJAX allows web pages to be updated asynchronously by exchanging data with a web server behind the scenes. This means that it is possible to update parts of a web page, without reloading the whole page.

As the demands of web applications become increasingly complex, JavaScript developers have taken their trial and errors with complex asynchronous programming and have developed the **Fetch API.**  Fetch allows us to make similar requests to files and servers like AJAX, but is built on **Promises**, and therefore helps us avoid the "callback hell" or "code spaghetti" that comes with trying to ensure a sequence of events executes in an expected and reproducible manner. This also gives us the benefit of more elegantly dealing with errors and being able to log those errors to have a more informative user interface.

Additionally, the Fetch API returns `response` objects to us that come with many intuitive and useful properties and methods.  

## Fetch API

Oftentimes, we will have a separate backend (including our server) and frontend (for example, rendering our webpage using Javascript), and the frontend needs to reach out to the backend to get resources, or data, from the server.

The [Fetch API][mdn-fetch-api] is an API used to fetch these resources from the server.
It is natively supported by the latest versions of Chrome, Firefox, and Opera.

Our repository features a Sinatra server that we will be using for the subsequent examples.
To get the server set up, open a new terminal tab and run the following from the root of our project directory:

```sh
et get fetch-and-express
cd fetch-and-express
yarn install
yarn run dev
```

The server file in this repo has several paths to simulate how you would interact with fetching data from an API with both successful and unsuccessful server responses.  Let’s first take a look at a simple pathway called ‘test’.

Open another tab in iterm, let's start by making a GET request to the server via the following cURL request:

```sh
curl -i -X GET "http://localhost:3000/test"
```

You will get back the following response from the server:

```sh
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
ETag: W/"b-e1AsOh9IyGCa4hLN+2Od7jlnP14"
Date: Mon, 29 Apr 2019 01:45:10 GMT
Connection: keep-alive

Hello world
```

Let's perform the same request using the Fetch API!  The Fetch API will allow us to access the data through code itself, rather than simply through the command line with cURL. We will be writing to the js file `client.js` in your `public/js/` directory.  

```javascript
// client.js

fetch('http://localhost:3000/test')
  .then(response => {
    console.log('response', response);
    console.log('response.status:', response.status);
    console.log('response.statusText:', response.statusText);
    console.log('response.ok:', response.ok);
    return response.text();
  })
  .then(responseBody => {
    console.log('responseBody:', responseBody);
  });
```

Navigate to the root directory of <http://localhost:3000/> and open up your browsers developers tool.  Take your time looking at the log.

We use the Fetch API via the `fetch` method in our Javascript file, which takes in the URL of the resource for its argument and returns a promise.  Unless a different verb is specified, `fetch` will default to a GET request.

When the Fetch API replies to a request, it creates a [`Response`][mdn-response] object.  The response object is the interface of the Fetch API that we can interact with.  It was designed with remarkable properties and methods that correlate with our knowledge of HTTP to make interacting with it painless and intuitive.

Once the promise is fulfilled, the promise's value will be a Response object.
A `Response` object has many handy properties such as:

* `status` which is the status code of the response.
* `statusText` which is the status message corresponding to the status code.
* `ok` which is boolean that evaluates to `true` if the response status code is in the range of 200-299, but `false` otherwise.
* `text` which is a method that returns another promise, which upon becoming fulfilled will have its value equal a string representing the response body.
* `json` which is a method that returns another promise, which upon becoming fulfilled will have its value equal an object representing the JSON parsed response body.

If we take a look at our terminal we will see the following:

In our first "onFulfilled" callback (`.then` section of the method), we outputted some of the property values of the `response` object.
Something to note is that we cannot access the body of the response directly from the `response` object.
Instead we must return the value of `response.text()`, which is another promise, in the first "onFulfilled" callback.
Once that promise is fulfilled, then the second "onFulfilled" callback will have the response body as a string as its first argument, and we can do with it as we please. In this way, our fetch method is creating a string of promises with a new response value each time a promise is fulfilled.

One quirk about the `fetch` method is that its returned promise will not be rejected if the response status is erroneous.
For example, if you run the following cURL request:

```sh
curl -i -X GET "http://localhost:3000/test-error"
```

You will get the following response:

```sh
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 0
ETag: W/"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"
Date: Mon, 29 Apr 2019 01:48:56 GMT
Connection: keep-alive
```

If we update our code to make a request to this path as such:

```javascript
// client.js

fetch('http://localhost:3000/test-error')
...
```

An error is raised, but the code of both "onFulfilled" functions still runs.
This might not be desired especially if we have "onFulfilled" functions that make changes to our application based on the data from the responses. We may want to simply output an error rather than continuing through the rest of the method.
However, we can update our code so it does not run application critical "onFulfilled" functions if we get back an erroneous response:

```javascript
// client.js

fetch('http://localhost:3000/test-error')
  .then(response => {
    if (response.ok) {
      return response;
    } else {
      let errorMessage = `${response.status} (${response.statusText})`,
          error = new Error(errorMessage);
      throw(error);
    }
  })
  .then(response => {
    console.log('response', response);
    console.log('response.status:', response.status);
    console.log('response.statusText:', response.statusText);
    console.log('response.ok:', response.ok);
    return response.text();
  })
  .then(responseBody => {
    console.log('responseBody:', responseBody);
  })
  .catch(error => console.error(`Error in fetch: ${error.message}`));
```

Here we have created another "onFulfilled" callback that runs first to check if the response status is in the range of 200-299.

If the response status code falls within that range, then the subsequent "onFulfilled" callbacks will get executed, but if it is not, then an error will be thrown, and it will be received by our `catch` method.
In this `catch` method, we are only outputting a custom error message to the console, but our application could run additional code in this method to handle the error gracefully.

Let's run our client side script again by refreshing the page.

The previous error is still raised along with our own error message from our `catch` method.
Most importantly, we have limited the "onFulfilled" callbacks which are executed.

Now what about obtaining JSON data from a backend server?
The process is pretty similar.
In our root directory, we have a `books.json` file which initially contains the following information:

```json
{
  "books": [
    {
      "id": 1,
      "name": "my first book"
    }
  ]
}
```

If we run the following cURL request:

```sh
curl -i -X GET "http://localhost:3000/books.json"
```

Our server responds with the data from `books.json`:

```sh
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 43
ETag: W/"2b-0VvbbUshRLs7oSoJMWJVZdyukLM"
Date: Mon, 29 Apr 2019 01:51:02 GMT
Connection: keep-alive

{"books":[{"id":1,"name":"my first book"}]}
```

We can do the same using `fetch` with the following code:

```javascript
// client.js

fetch('http://localhost:3000/books.json')
  .then(response => {
    if (response.ok) {
      return response;
    } else {
      let errorMessage = `${response.status} (${response.statusText})`,
          error = new Error(errorMessage);
      throw(error);
    }
  })
  .then(response => response.text())
  .then(body => {
    console.log(body);
    let bodyParsed = JSON.parse(body);
    console.log(bodyParsed);
  })
  .catch(error => console.error(`Error in fetch: ${error.message}`));
```

Since we get back the body as a JSON formatted string, we must call `JSON.parse` to convert it to a JavaScript object, so that we can actually work with the data inside.

Let's refresh our page again.

Here we see the value of the `body` string and the object that it returned from parsing the `body` string.
This object matches the data that we had in our `books.json` file!

We can further refactor this code to instead use the `Response` object's `json` method, which will parse a json formatted response body for us:

```javascript
// client.js

fetch('http://localhost:3000/books.json')
  .then(response => {
    if (response.ok) {
      return response;
    } else {
      let errorMessage = `${response.status} (${response.statusText})`,
          error = new Error(errorMessage);
      throw(error);
    }
  })
  .then(response => response.json())
  .then(body => {
    console.log(body);
  })
  .catch(error => console.error(`Error in fetch: ${error.message}`));
```

Now if we check our console, we see that `body` is already the object representing the data in our `books.json` file.

Awesome, but how about a POST request?
We can actually add data to our `books.json` file with the following cURL request:

```sh
curl -i -X POST -H "Content-Type: application/json" -d '
{
  "book": {
      "name": "book from cURL"
  }
}
' "http://localhost:3000/books.json"
```

Our server will respond with the newly created book resource:

```no-highlight
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 7
ETag: W/"7-rM9AyJuqT6iOan/xHh+AW+7K/T8"
Date: Mon, 29 Apr 2019 01:55:15 GMT
Connection: keep-alive

Created
```

Also, if we check our `books.json` file, we will see that it now has the new book.

```json
{
  "books": [
    {
      "id": 1,
      "name": "my first book"
    },
    {
      "id": 2,
      "name": "book from cURL"
    }
  ]
}
```

We can accomplish the same with the following code using fetch:

```javascript
let data = {
  book: {
    name: 'book from fetch'
  }
};
let jsonStringData = JSON.stringify(data);

fetch('http://localhost:3000/books.json', {
  method: 'post',
  body: jsonStringData
})
  .then(response => {
    if (response.ok) {
      return response;
    } else {
      let errorMessage = `${response.status} (${response.statusText})`,
          error = new Error(errorMessage);
      throw(error);
    }
  })
  .then(response => response.json())
  .then(body => {
    console.log(body);
  })
  .catch(error => console.error(`Error in fetch: ${error.message}`));
```

The `fetch` method defaults to a GET request, but if we want to specify the HTTP verb and a request body, then we pass an object that specifies these details as a second argument.
Here, we also created the data, converted the data to a JSON formatted string so that fetch can interpret it, and used the JSON formatted string for the request body.
If we check out our console, we will see that we get back the created resource as an object!

Also, our `books.json` file has been updated!

```json
{
  "books": [
    {
      "id": 1,
      "name": "my first book"
    },
    {
      "id": 2,
      "name": "book from cURL"
    },
    {
      "id": 3,
      "name": "book from fetch"
    }
  ]
}
```

## Summary

In this article, we have demonstrated the advantage of using ES6 Promises for asynchronous functions.
We also looked at the Fetch API's `fetch` function as an example of an asynchronous function which uses promises to retrieve resources from servers. **Remember** a fetch is still an HTTP request, but with JS, and because of the asynchronous nature of JS, there are additional factors and tools we need in order to handle it properly. 
Most importantly, through the use of the Fetch API, you will be able to utilize a back-end server to persist the data in your future React applications.  

### External Resources
* [Promise][mdn-promise]
* [Promise.prototype.then][mdn-promise-prototype-then]
* [Promise.prototype.catch][mdn-promise-prototype-catch]
* [Fetch API][mdn-fetch-api]
* [Github's fetch polyfill][github-fetch]
* [Using Fetch][mdn-using-fetch]
* [Response Objects][mdn-response]
* [WHATWG Fetch Specification][whatwg-fetch-specification]

[github-fetch]: https://github.com/github/fetch
[mdn-fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[mdn-promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[mdn-promise-prototype-then]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
[mdn-promise-prototype-catch]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
[mdn-using-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[whatwg-fetch-specification]: https://fetch.spec.whatwg.org/
