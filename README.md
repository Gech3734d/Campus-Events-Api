# Campus Events API
## 1. Project Overview
A NestJS REST API for managing campus events and their sessions.
This project demonstrates:
- REST API routing
- Path parameters and query parameters
- Filtering events by category and publication status
- Sorting and pagination
- Retrieving upcoming events
- Managing event sessions
- Request validation
- Appropriate HTTP status codes
## 2. Technologies Used
- Node.js
- NestJS
- TypeScript
- Postman
## 3. Requirements
- Node.js (LTS recommended)
- npm
- Postman
## 4. Installation and Running
Clone the repository:
git clone https://github.com/Gech3734d/camus-events-api.git
Move into the project folder:
cd camus-events-api
Install dependencies:
npm install
Start the development server:

npm run start:dev

API base URL:http://127.0.0.1:3000/api


## 5. API Endpoints

 GET  `/api/events`  Get all events 
 GET  `/api/events?category=technology`  Filter by category 
 GET  `/api/events?isPublished=true`  Filter by publication status 
 GET  `/api/events?sortBy=eventDate&order=asc&page=2&limit=2`  Sort and paginate 
 GET  `/api/events/upcoming` Get upcoming events 
 GET  `/api/events/evt-101`  Get an event by ID 
 GET  `/api/events/not-real`  Request a missing event 
 GET  `/api/events/evt-101/sessions` Get sessions for an event  GET `/api/events/evt-101/sessions/ses-201`  Get a specific session 
 POST  `/api/events`  Create a new event 

## 6. Filtering, Sorting and Pagination

The API supports filtering, sorting, and pagination using query parameters.

**Filtering:** Select events matching conditions such as `category=technology` or `isPublished=true`.

**Sorting:** Arrange events using a field such as `eventDate` and a direction such as `asc` or `desc`.

**Pagination:** Return a selected page of results.

Offset formula:


offset = (page - 1) * limit

Example:


page = 3
limit = 5
offset = (3 - 1) * 5 = 10


The correct processing order is:

**Filtering → Sorting → Pagination**

## 7. API Testing Results

All 11 assignment requests were tested using Postman.

| # | Test | Expected | Actual | Result |

| 1 | Get all events | 200 | 200 | PASS |
| 2 | Filter by category | 200 | 200 | PASS |
| 3 | Filter by publication status | 200 | 200 | PASS |
| 4 | Sort and paginate | 200 | 200 | PASS |
| 5 | Get upcoming events | 200 | 200 | PASS |
| 6 | Get an existing event | 200 | 200 | PASS |
| 7 | Request a missing event | 404 | 404 | PASS |
| 8 | Get sessions for an event | 200 | 200 | PASS |
| 9 | Get a session under its event | 200 | 200 | PASS |
| 10 | Create a valid event | 201 | 201 | PASS |
| 11 | Missing title validation | 400 | 400 | PASS |

**Test Summary: 11/11 PASS**

## 8. Reflection Answers

**1. What is the difference between a path parameter and a query parameter?**

A path parameter identifies a specific resource, for example `/events/evt-101`. A query parameter filters or controls a returned list, for example `/events?category=technology`.

**2. Why should `/upcoming` be declared before `/:id`?**

`/upcoming` is a static route. Declaring it first prevents the word `upcoming` from being interpreted as an event ID by a conflicting dynamic route.

**3. Why should filtering happen before pagination?**

Filtering first ensures that the page contains only records matching the requested conditions.

**4. What is the offset for page 3 with limit 5?**

`offset = (3 - 1) * 5 = 10`. The page starts at array index 10 and returns indexes 10–14.

**5. Why does a controller call a service?**

It separates HTTP request handling from business logic, making the code easier to test, reuse, and maintain.

**6. What status code should be returned when an event does not exist?**

`404 Not Found`, because the requested event does not exist.

## 9. Screenshots and Postman Collection

Postman test screenshots are stored in the `screenshots/` folder.

The Postman collection is included as:

`Day56-Campus-Events-API.postman_collection.json`

Screenshots should show the request URL, response status, and response body.

## 10. Conclusion

The Campus Events API exercise demonstrates how to build and test REST API endpoints using NestJS. It covers routing, query parameters, filtering, sorting, pagination, nested resources, validation, and HTTP status codes.

All 11 assignment test requests returned their expected status codes.