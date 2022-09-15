import knex from "knex";

class contenedorDB {
    constructor(options, table) {
        this.options = options,
        this.table = table
    }

    async tableExists() {
        return await knex(this.options).schema.hasTable(this.table);
    }

    async createTable() {
        await knex(this.options).schema.createTable(this.table, (table) => {
            table.increments('id');
            if(this.table == 'mensajes') 
            {
                table.string('email');
                table.string('mensaje');
                table.date('fyh')
            } 
            else if (this.table == 'productos') 
            {
                table.string('title');
                table.float('price');
                table.string('thumbnail');
            }
        })
        .then(()=> console.log("Tabla creada"))
        .catch(err => console.log(err));
    }

    async dropTable() {
        await knex(this.options).schema.dropTable(this.table)
        .then(() => console.log("Tabla Borrada"))
        .catch(err => console.log(err));
    }

    async selectData() {
        try {
            if (! await this.tableExists()) {
                await this.createTable()
            }
            return await knex(this.options).from(this.table).select('*');;
        } catch (err) {
            console.log(err); throw err;
        }
    }

    async selectById(id) {
        try {
            const data = await knex(this.options)(this.table).where('id', id);
            return data;
        } catch (err) {
            console.log(err); throw err;
        }
    }

    async addData(data) {
        await knex(this.options)(this.table).insert(data)
        .then(()=> console.log("Dato agregado"))
        .catch((err) => {console.log(err); throw err})
    }

    async deleteData(id) {
        await knex(this.options)(this.table).where('id', id).del()
        .then(()=> console.log('Dato Eliminado'))
        .catch((err) => {console.log(err); throw err})
    }

}

export default contenedorDB;