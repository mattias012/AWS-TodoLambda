// Importerar en modul för att skapa unika ID:n
const { v4: uuidv4 } = require('uuid');

// Skapar en variabel för att lagra alla todos
let todos = [];

// Hjälpfunktion för att skapa ett HTTP-svar med standardheaders
function response(statusCode, data) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  // Tillåt anrop från andra domäner
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"  // Tillåt specifika HTTP-metoder
        },
        body: JSON.stringify(data),
    };
}

// Huvudfunktionen som körs varje gång Lambda triggas
exports.handler = async (event) => {
    // Hämtar HTTP-metoden från anropet (GET, POST, PUT, DELETE)
    const method = event.httpMethod;
    // Tolkar anropets body-data (om det finns) till JSON-format
    const body = event.body ? JSON.parse(event.body) : null;
    // Hämtar ID från URL-parameter (om ett specifikt ID är angivet)
    const id = event.pathParameters ? event.pathParameters.id : null;

    // Välj funktion baserat på HTTP-metoden
    switch (method) {
        case 'GET':
            return getTodos();
        case 'POST':
            return addTodo(body);
        case 'PUT':
            return updateTodo(id, body);
        case 'DELETE':
            return deleteTodo(id);
        default:
            return response(405, { message: 'Method Not Allowed' });
    }
};

// Funktion för att hämta alla todos
function getTodos() {
    return response(200, todos);
}

// Funktion för att lägga till en ny todo
function addTodo(data) {
    if (!data || !data.text) {
        return response(400, { message: 'Invalid input' });
    }

    const newTodo = {
        id: uuidv4(),  // Skapar ett unikt ID för todo
        text: data.text,
        completed: false,
    };
    todos.push(newTodo);

    return response(201, newTodo);
}

// Funktion för att uppdatera en befintlig todo
function updateTodo(id, data) {
    if (!id || !data || !data.text) {
        return response(400, { message: 'Invalid input' });
    }

    const todo = todos.find((t) => t.id === id);
    if (!todo) {
        return response(404, { message: 'Todo not found' });
    }

    // Uppdaterar text och/eller status
    todo.text = data.text;
    if (data.completed !== undefined) {
        todo.completed = data.completed;
    }

    return response(200, todo);
}

// Funktion för att ta bort en todo
function deleteTodo(id) {
    if (!id) {
        return response(400, { message: 'Invalid input' });
    }

    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
        return response(404, { message: 'Todo not found' });
    }

    todos.splice(index, 1);

    return response(200, { message: 'Todo deleted' });
}
