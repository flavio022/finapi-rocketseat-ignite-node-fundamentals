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

function getBalance(statement) {
    const balance = statement.reduce((acc, opertation) => {
        if (opertation.type === 'credit') {
            return acc + opertation.amount;
        } else {
            return acc - opertation.amount;
        }

    }, 0)

    return balance;
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

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    };

    customer.statements.push(statementOperation);

    return response.status(201).send();

});

app.post("/withdraw", verifyIfExistAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statements);

    if (balance < amount) {
        return response.status(400).json({ error: 'Insufficient founds!' })
    }

    const statementOpertation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }
    customer.statements.push(statementOpertation);

    return response.status(201).send();
})
app.get("/statement/date", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;
    console.log(date);
    const dateFormat = new Date(date + " 00:00");
    customer.statements.forEach(element => {
        console.log(element.created_at.toDateString());
    });
    console.log(dateFormat);
    console.log(new Date(dateFormat).toDateString());

    statement = customer.statements.filter((statement) =>
        statement.created_at.toDateString() === new Date(dateFormat).toDateString());
    return response.json(statement);
});

app.put("/account", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;
    const { name } = request.body;

    customer.name = name;
    return response.status(201).send();

});

app.get("/account", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});
app.delete("/account", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;

    customers.splice(customer, 1);
    return response.status(200).json(customers);

});

app.get("/balance", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statements);

    return response.json(balance);
})
app.listen(3000);
