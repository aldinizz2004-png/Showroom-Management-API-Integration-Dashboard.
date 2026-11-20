# Showroom Management Dashboard

A responsive dashboard for managing a Chery, OMODA and JAECOO vehicle showroom. Vehicles are stored in a local REST API built with JSON Server, and the interface is written in vanilla JavaScript with ES modules.

## Features

- Overview statistics: total, available, reserved and sold vehicles, total inventory value and average price
- Create, edit, view and delete vehicles through the REST API
- Search by brand or model, filter by brand, status and price range, sort by price or year, and reset all filters
- Form validation, loading, empty, success and error states, and protection against duplicate submissions
- Separate handling of network errors and HTTP errors (400, 401, 404, 500)

## Tech stack

- HTML5, CSS (Grid and Flexbox), JavaScript (ES modules, async/await, Fetch API)
- JSON Server 0.17.4

## Project structure

```
dashboardCar/
├── index.html
├── css/styles.css
├── db.json
└── js/
    ├── api.js         HTTP requests and error handling
    ├── vehicles.js    filtering, searching, sorting and validation
    ├── dashboard.js   statistics
    ├── ui.js          DOM rendering
    └── main.js        initialization and events
```

## Getting started

```
npm install
npm run api
npm run web
```

Open http://localhost:5500. The API runs on http://localhost:3000.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /vehicles | Retrieve all vehicles |
| GET | /vehicles/:id | Retrieve one vehicle |
| GET | /vehicles?brand=Chery | Filter vehicles with query parameters |
| POST | /vehicles | Add a vehicle |
| PUT | /vehicles/:id | Update a vehicle |
| DELETE | /vehicles/:id | Delete a vehicle |
