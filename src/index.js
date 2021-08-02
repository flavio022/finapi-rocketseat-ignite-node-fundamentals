const { response, request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find((customer) => customer.cpf === cpf);
    if (!customer) {
        return response.status(400).json({ error: "Customer not found!" })
    }
    request.customer = customer;
    return next();
}

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;
    const customersAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    )

    if (customersAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    }

    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statements: []
    })
    return response.json(customers);
}
);
app.get("/statement", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer.statements);
});

app.post("/deposit", verifyIfExistAccountCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;
    console.log(customer);

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    };

    customer.statements.push(statementOperation);

    return response.status(201).send();

});

app.listen(3000);
