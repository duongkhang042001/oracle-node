const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const oracledb = require('oracledb');

oracledb.autoCommit = true; 
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbConfig = {
    user          : "USERNAME",
    password      : "PASSWORD",
    connectString : "localhost:1521/XE",
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
};

app.get('/users', (req, res) => {
    let users = new Array();
    let connection;
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("SELECT * FROM users");
    })
    .then((result) => {
        res.status(200).json(result.rows);
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        console.log(error);
    });
});

app.get('/users/:userId', (req, res) => {
    let connection;
    let user = new Object();
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("SELECT * FROM users WHERE id = :id ",{
            id : req.params.userId
        });
    })
    .then((result) => {
        res.status(200).json(result.rows);
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        console.log(error);
    });
});

app.post('/users', (req, res) => {
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("INSERT INTO users (name, email) VALUES(:name , :email) RETURN id INTO :id",
        {
            name: req.body.name,
            email: req.body.email,
            id : {type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        });
    }).then((result) => {
        res.status(201).json("User successfully created! ID: "+result.outBinds.id[0]);            
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        console.log(error);
    });
});

app.put('/users/:userId', (req, res) => {
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("UPDATE users SET name = :name, email = :email WHERE id = :id",
        {
            id : req.params.userId,
            name: req.body.name,
            email: req.body.email
        });
    }).then(() => {
        res.status(200).json("User successfully updated! ID: "+ req.params.userId);            
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        console.log(error);
    });
});


app.delete('/users/:userId', (req, res) => {
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("DELETE FROM users WHERE id = :id",
        {
            id : req.params.userId
        });
    }).then(() => {
        res.status(200).json("User successfully deleted!");           
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        console.log(error);
    });
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);
});