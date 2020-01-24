# clearGlass

Simple server for search related APIs 

## Setup DB
add a config.js file on <ROOT>/config.js
```
module.exports = {
    host: '',
    user: '',
    password: '',
    database: ''  
}
```

## Run

```bash
npm install
npm start
```
> Node will start runing on **localhost:3002/**

you can change port 3002 in file **/bin/www** at line#15


## API End-Points

```

To get All results from database
GET /api/cost-explorer

Add filters for 
- projects 
- clients 
- cost_types
GET /api/cost-explorer?projects[]=1&projects[]=3&clients[]=1&clients[]=2&cost_types[]=12&cost_types[]=13


SAMPLE OUTPUT:
{
    "success": true,
    "results": [
        {
            "id": 3,
            "name": "Guardians of the Galaxy",
            "amount": 484296,
            "breakdown": [
                {
                    "id": 6,
                    "amount": 484296,
                    "name": "Project 6",
                    "breakdown": [
                        {
                            "id": 1,
                            "name": "Development",
                            "amount": 202257,
                            "breakdown": [
                                {
                                    "id": 4,
                                    "name": "Website Development",
                                    "amount": 101061,
                                    "breakdown": [
                                        {
                                            "id": 102,
                                            "name": "Payment Gateway License",
                                            "amount": 101200,
                                            "breakdown": []
                                        },
                                        {
                                            "id": 103,
                                            "name": "JavaScript Plugin License",
                                            "amount": 101057,
                                            "breakdown": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "id": 91,
                            "name": "Development",
                            "amount": 282039,
                            "breakdown": []
                        }
                    ]
                }
            ]
        }
    ]
}
```