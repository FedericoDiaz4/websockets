import mongoose from "mongoose";

const Conn = () => {
                     
    mongoose.connect("mongodb+srv://root:q1w2e3r4@cluster0.dxsuj0e.mongodb.net/?retryWrites=true&w=majority", 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true    
    }, err => {
        if (err) throw new Error(`Error al conectar a la base de datos. ${err}`)
        console.log('BD Conectada');
    })
};

export default Conn