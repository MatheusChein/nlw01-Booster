import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes" //Coloca "./"" porque é um arquivo da minha própria aplicação
import {errors} from "celebrate";

const app = express();
app.use(cors());

//Esse app.use substitui a necessidade de requisitar o pacote body parser. O express já vai ler os requests como JSON
app.use(express.json());

app.use(routes);

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")))

app.use(errors());

app.listen(3333, function(){
    console.log("Server has started succesfully");
});