var connection = require('../mysql');
costExplorer = {};
costExplorer.join = [];
costExplorer.where = "";
costExplorer.from = "";
costExplorer.select = "";
costExplorer.table = "costs";
costExplorer.tableAlias = "c";
costExplorer.queryParams = {};
costExplorer.query = "";
costExplorer.clients = [];
costExplorer.results = [];

costExplorer.find = function (req, callback) {
    this.clearValues()
        .setQueryParams(req.params)
        .addSelect(`SELECT cl.ID as client_ID,  cl.Name as client_name, p.ID as project_id, p.Title as project_name, c.ID as cost_id, ct.subtype_id, ct.type_id, ct.parent_id, ct.type, ct.subtype, ct.parent, c.Amount`)
        .addJoin('LEFT', '(SELECT a.id as subtype_id, a.name as subtype, b.id as type_id, b.name as type, cc.id as parent_id, cc.name as parent FROM cost_types a LEFT JOIN cost_types b ON b.ID = a.Parent_Cost_Type_ID LEFT JOIN cost_types cc ON cc.ID = b.Parent_Cost_Type_ID) ct ON c.Cost_Type_ID = ct.subtype_id')
        .addJoin('LEFT', 'projects p ON p.ID = c.Project_ID')
        .addJoin('LEFT', 'clients cl ON p.Client_ID = cl.ID')
        .addWhere()
        .setFrom()
        .buildQuery()
        .__execute(callback);
}

costExplorer.clearValues = function () {
    this.join = [];
    this.where = "";
    this.from = "";
    this.select = "";
    this.table = "costs";
    this.tableAlias = "c";
    this.queryParams = {};
    this.query = "";
    this.results = [];
    this.clients = [];
    return this;
}

costExplorer.setQueryParams = function (queryParams) {
    this.queryParams = queryParams;
    return this;

}

costExplorer.__execute = function (callback) {
    var self = this;
    console.log(this.query);
    connection.query(this.query, function (error, results) {
        if (error) throw error;
        self.formatResults(results, callback);
    });
}

costExplorer.formatResults = function (results, callback) {
    results.map(el => {
        var clIndex = this.clients.findIndex(cl => cl.id == el.client_ID);
        if (clIndex < 0) {
            if (el.parent_id) {
                this.clients.push({
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
                    this.clients.push({
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
                    this.clients.push({
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
            if (!this.clients[clIndex].amount) { this.clients[clIndex].amount = 0; }
            this.clients[clIndex].amount = this.clients[clIndex].amount + el.Amount;
            // checking project
            var proIndex = this.clients[clIndex].breakdown.findIndex(pro => pro.id == el.project_id);
            // project doesnt exists os adding as it is
            if (proIndex < 0) {
                this.clients[clIndex].breakdown.push({
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
                if (!this.clients[clIndex].breakdown[proIndex].amount) { this.clients[clIndex].breakdown[proIndex].amount = 0; }
                this.clients[clIndex].breakdown[proIndex].amount = this.clients[clIndex].breakdown[proIndex].amount + el.Amount;
                // debugger;
                // check if client has parent exists
                if (el.parent_id) {
                    var parIndex = this.clients[clIndex].breakdown[proIndex].breakdown.findIndex(par => par.id == el.parent_id);
                    // debugger;
                    if (parIndex < 0) {
                        this.clients[clIndex].breakdown[proIndex].breakdown.push({
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
                        if (!this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount) { this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount = 0; }
                        this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount = this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].amount + el.Amount;

                        // it has parent so lets check if type exists
                        var typeIndex = this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown.findIndex(tp => tp.id == el.type_id);
                        if (typeIndex < 0) {
                            this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown.push({
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
                            if (!this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount) { this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount = 0; }
                            this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount = this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].amount + el.Amount;
                            this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown[typeIndex].breakdown.push({
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
                        if (!this.clients[clIndex].breakdown[proIndex].amount) { this.clients[clIndex].breakdown[proIndex].amount = 0; }
                        this.clients[clIndex].breakdown[proIndex].amount = this.clients[clIndex].breakdown[proIndex].amount + el.Amount;
                        var parIndex = this.clients[clIndex].breakdown[proIndex].breakdown.findIndex(parent => parent.id == el.type_id);
                        if (parIndex < 0) {
                            this.clients[clIndex].breakdown[proIndex].breakdown.push({
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
                            this.clients[clIndex].breakdown[proIndex].breakdown[parIndex].breakdown.push({
                                id: el.cost_id,
                                name: el.subtype,
                                amount: el.Amount,
                                breakdown: []
                            });
                        }
                    } else {
                        // there is no type id which means its just a subtype
                        this.clients[clIndex].breakdown[proIndex].breakdown.push({
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
    callback(false, this.clients);
}

costExplorer.buildQuery = function (callback) {
    console.log(`
    ${this.select}
    ${this.from}
    ${this.join.join(' ')}
    ${this.where}
    `)
    this.query = `${this.select}${this.from}${this.join.join(' ')}${this.where}`;
    return this;
}

costExplorer.setFrom = function () {
    this.from = ` FROM \`${this.table}\` ${this.tableAlias}`;
    return this;
}

costExplorer.addJoin = function (type = 'LEFT', join = "") {
    this.join.push(` ${type} JOIN ${join} `);
    return this;
}
costExplorer.addSelect = function (select) {
    this.select = select;
    return this;
}
costExplorer.addWhere = function () {
    if (Object.keys(this.queryParams).length > 0) {
        var str = "WHERE";
        if (this.queryParams.hasOwnProperty('clients') && this.queryParams.clients) {
            str = str + " cl.ID IN (" + this.queryParams.clients.join() + ") AND"
        }
        if (this.queryParams.hasOwnProperty('projects') && this.queryParams.projects) {
            str = str + " Project_ID IN (" + this.queryParams.projects.join() + ") AND";
        }
        if (this.queryParams.hasOwnProperty('cost_types') && this.queryParams.cost_types) {
            str = str + " ct.subtype_id IN (" + this.queryParams.cost_types.join() + ") AND";
        }
        this.where = str.slice(0, -3)
    }
    return this;
}

module.exports = costExplorer