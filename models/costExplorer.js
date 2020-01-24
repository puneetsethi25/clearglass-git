var connection = require('../mysql');
costExplorer = {};
//173269
costExplorer.find = function (params, callback) {
    var query = `
    SELECT  
    cl.ID as client_ID,  cl.Name as client_name, 
    p.ID as project_id, p.Title as project_name, 
    c.ID as cost_id, ct.subtype_id, ct.type_id, ct.parent_id, ct.type, ct.subtype, ct.parent, 
    c.Amount,
    (SELECT SUM(Amount) FROM costs csum WHERE c.ID = csum.ID) as sum_value
    FROM \`costs\` c
    LEFT JOIN 
    (SELECT a.id as subtype_id, a.name as subtype, b.id as type_id, b.name as type, cc.id as parent_id, cc.name as parent FROM cost_types a LEFT JOIN cost_types b ON b.ID = a.Parent_Cost_Type_ID LEFT JOIN cost_types cc ON cc.ID = b.Parent_Cost_Type_ID)
    ct ON c.Cost_Type_ID = ct.subtype_id
    
    
    LEFT JOIN projects p ON p.ID = c.Project_ID
    LEFT JOIN clients cl ON p.Client_ID = cl.ID
    `;
    str = "";
    if (Object.keys(params).length > 0) {
        str = "WHERE";
        if (params.hasOwnProperty('clients')) {
            str = str + " cl.ID IN (" + params.clients.join() + ") AND"
        }
        if (params.hasOwnProperty('projects') && params.projects) {
            str = str + " Project_ID IN (" + params.projects.join() + ") AND";
        }
        if (params.hasOwnProperty('cost_types') && params.cost_types) {
            str = str + " ct.subtype_id IN (" + params.cost_types.join() + ") AND";
        }
        str = str.slice(0, -3)
    }
    query = query + str;

    console.log(query);

    connection.query(query, function (error, results) {
        // callback(error, results);
        if (error) throw error;
        var clients = [];
        results.map(el => {
            var clIndex = clients.findIndex(cl => cl.id == el.client_ID);
            if (clIndex < 0) {
                if (el.parent_id) {
                    clients.push({
                        id: el.client_ID,
                        name: el.client_name,
                        amount: el.Amount,
                        breakdown: [{
                            id: el.project_id,
                            amount: el.Amount,
                            name: el.project_name,
                            breakdown: [{
                                id: el.parent_id,
                                name: el.parent,
                                amount: el.Amount,
                                breakdown: [{
                                    id: el.type_id,
                                    name: el.type,
                                    amount: el.type_id,
                                    breakdown: [{
                                        id: el.cost_id,
                                        name: el.subtype,
                                        amount: el.Amount,
                                        breakdown: []
                                    }]
                                }]
                            }]
                        }]
                    })
                } else {
                    if (el.type_id) {
                        clients.push({
                            id: el.client_ID,
                            name: el.client_name,
                            amount: el.Amount,
                            breakdown: [{
                                id: el.project_id,
                                amount: el.Amount,
                                name: el.project_name,
                                breakdown: [{
                                    id: el.type_id,
                                    name: el.type,
                                    amount: el.Amount,
                                    breakdown: [{
                                        id: el.cost_id,
                                        name: el.subtype,
                                        amount: el.Amount,
                                    }]
                                }]
                            }]
                        })
                    } else {
                        clients.push({
                            id: el.client_ID,
                            name: el.client_name,
                            amount: el.Amount,
                            breakdown: [{
                                id: el.project_id,
                                amount: el.Amount,
                                name: el.project_name,
                                breakdown: [{
                                    id: el.cost_id,
                                    name: el.subtype,
                                    amount: el.Amount,
                                    breakdown: []
                                }]
                            }]
                        })
                    }
                }

            } else {
                // found client adding amount 
                if (!clients[clIndex].amount) { clients[clIndex].amount = 0; }
                clients[clIndex].amount = clients[clIndex].amount + el.Amount;
                // checking project
                var proIndex = clients[clIndex].breakdown.findIndex(pro => pro.id == el.project_id);
                // project doesnt exists os adding as it is
                if (proIndex < 0) {
                    clients[clIndex].breakdown.push({
                        id: el.project_id,
                        amount: el.amount,
                        name: el.project_name,
                        breakdown: [{
                            id: el.parent_id,
                            name: el.parent,
                            amount: el.Amount,
                            breakdown: [{
                                id: el.type_id,
                                name: el.type,
                                amount: el.type_id,
                                breakdown: [{
                                    id: el.cost_id,
                                    name: el.subtype,
                                    amount: el.Amount,
                                    breakdown: []
                                }]
                            }]
                        }]
                    })
                } else {
                    // adding amount to project value 
                    if (!clients[clIndex].breakdown[proIndex].amount) { clients[clIndex].breakdown[proIndex].amount = 0; }
                    clients[clIndex].breakdown[proIndex].amount = clients[clIndex].breakdown[proIndex].amount + el.Amount;
                    // debugger;
                    // check if client has parent exists
                    if (el.parent_id) {
                        var parIndex = clients[clIndex].breakdown[proIndex].breakdown.findIndex(par => par.id == el.parent_id);
                        // debugger;
                        if (parIndex < 0) {
                            clients[clIndex].breakdown[proIndex].breakdown.push({
                                id: el.parent_id,
                                name: el.parent,
                                amount: el.Amount,
                                breakdown: [{
                                    id: el.type_id,
                                    name: el.type,
                                    amount: el.Amount,
                                    breakdown: [{
                                        id: el.cost_id,
                                        name: el.subtype,
                                        amount: el.Amount,
                                        breakdown: []
                                    }]
                                }]
                            })
                        } else {
                            // adding amount to parent value 
                            if (!clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount) { clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount = 0; }
                            clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount = clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount + el.Amount;

                            // it has parent so lets check if type exists
                            var typeIndex = clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown.findIndex(tp => tp.id == el.type_id);
                            if (typeIndex < 0) {
                                clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown.push({
                                    id: el.type_id,
                                    name: el.type,
                                    amount: el.Amount,
                                    breakdown: [{
                                        id: el.cost_id,
                                        name: el.subtype,
                                        amount: el.Amount,
                                        breakdown: []
                                    }]
                                })
                            } else {
                                // adding amount in the type 
                                if (!clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount) { clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount = 0; }
                                clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount = clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount + el.Amount;
                                clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].breakdown.push({
                                    id: el.cost_id,
                                    name: el.subtype,
                                    amount: el.Amount,
                                    breakdown: []
                                })
                            }
                        }
                    } else {
                        if (el.type_id) {
                            // if there is type_id then it means that type id is parent id
                            // it has parent so lets check if type exists
                            if (!clients[clIndex].breakdown[proIndex].amount) { clients[clIndex].breakdown[proIndex].amount = 0; }
                            clients[clIndex].breakdown[proIndex].amount = clients[clIndex].breakdown[proIndex].amount + el.Amount;
                            var parIndex = clients[clIndex].breakdown[proIndex].breakdown.findIndex(parent => parent.id == el.type_id);
                            if (parIndex < 0) {
                                clients[clIndex].breakdown[proIndex].breakdown.push({
                                    id: el.type_id,
                                    name: el.type,
                                    amount: el.Amount,
                                    breakdown: [{
                                        id: el.cost_id,
                                        name: el.subtype,
                                        amount: el.Amount,
                                        breakdown: []
                                    }]
                                })

                            } else {
                                // adding amount to parent value 
                                clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown.push({
                                    id: el.cost_id,
                                    name: el.subtype,
                                    amount: el.Amount,
                                    breakdown: []
                                });
                            }
                        } else {
                            // there is no type id which means its just a subtype
                            clients[clIndex].breakdown[proIndex].breakdown.push({
                                id: el.cost_id,
                                name: el.subtype,
                                amount: el.Amount,
                                breakdown: []
                            })
                        }
                    }
                }
            }
        })
        callback(error, clients);
    });
}
module.exports = costExplorer