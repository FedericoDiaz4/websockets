const sqlliteOptions = {
    client: 'sqlite3',
    connection: { filename: "./ecommerce.sqlite"},
    useNullAsDefault: true
}

export default sqlliteOptions;