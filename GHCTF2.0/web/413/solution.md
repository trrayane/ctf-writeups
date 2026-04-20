# Writeup

## 413 Challenge

### Solution

The challenge presents a simple web interface with a text input and a submit button. The objective is to bypass an Nginx body size limit of 200 bytes and successfully submit 200 text characters.

The key vulnerability exploited here is **Type Confusion** in JavaScript, which allows tricking the server into misinterpreting the submitted data. By sending a JavaScript object instead of a plain string, the server incorrectly evaluates the length of the input, bypassing the size restriction.

### Steps to solve the challenge:

1. Open **Postman** (or any API testing tool)
2. Send a `POST` request to the challenge's submit endpoint (`/submit`) using the `application/x-www-form-urlencoded` content type
3. In the request body, set the `text` field as a JavaScript object containing a `length` property with a value of `300`:

text[length]=300


4. Since JavaScript's `length` property of an object is not the same as the string length, the server mistakenly interprets the input as having 300 characters
5. JavaScript implicitly converts the string `'300'` to a number when comparing it to the `length` property, making the check pass
6. The server accepts the request and returns a success message, confirming the bypass