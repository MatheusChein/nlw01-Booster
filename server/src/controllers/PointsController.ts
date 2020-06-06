import {Request, Response} from "express"
import knex from "../database/connection";

class PointsController {
  async index(req: Request, res: Response) {
    //filtrar por cidade, uf, itens (usar os Query Parameters)
    const {city, uf, items} = req.query;

    //Isso aqui vai lidar com a parte do query relacionada aos itens, porque na rota o value vai ser o id do item. Ex: http://localhost:3000/points?items=1,2
    const parsedItems = String(items) //Garante que seja uma string
    .split(",") //Vai dividir a string em várias strings, onde o delimitador é a vírgula. Isso gera um array com essas várias strings
    .map(item => Number(item.trim())); //Procura no array todo e usa o método trim() para eliminar os espaços em cada item do array, e no final ainda transforma em um número, resultando em um array só com números

    const points = await knex("points")
    .join("point_items", "points.id", "=", "point_items.point_id")
    .whereIn("point_items.item_id", parsedItems)
    .where("city", String(city))
    .where("uf", String(uf))
    .distinct()
    .select("points.*");

    const serializedPoints = points.map(point =>{
      return {
        ...point,
        image_url: `http://192.168.0.19:3333/uploads/${point.image}`
      };
    });

    return res.json(serializedPoints);    
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return res.status(400).json({message: "Point not found."});
    }

    const serializedPoint = {
        ...point,
        image_url: `http://192.168.0.19:3333/uploads/${point.image}`
    };


    const items = await knex("items")
    .join("point_items", "items.id", "=", "point_items.item_id")
    .where("point_items.point_id", id)
    .select("items.title");

    return res.json({serializedPoint, items});
  }

  async create(req: Request, res: Response) {
    const { //Isso é o mesmo que fazer const name = req.body.name um por um
      name,
      email, 
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body;

    const point = {
      image: req.file.filename,
      name, //Aqui é o mesmo que fazer name: name, email: email um por um. É uma sintaxe mais curta, já que o nome da propriedade e da variável é a mesma
      email, 
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
      
    const trx = await knex.transaction(); //trx é a abreveação de transaction, um método que serve para garantir que, se uma das queries abaixo falhar, a outra também não execute
      
    const insertedIds = await trx("points").insert(point); //O método insert, além de inserir os dados na tabela, retorna os ids dos dados que foram inseridos na tabela. Portanto, podemos associá-lo a uma variável
      
    const point_id = insertedIds[0] //Não sei exatamente porque o insertedIds é um array, mas tudo bem
      
    const pointItems = items
    .split(",")
    .map((item: string) => Number(item.trim()))
    .map((item_id: number) => { //O método map serve para percorrer todo um array. É um método javascript convencional
      return {
        item_id,
        point_id
      };
    });
      
    await trx("point_items").insert(pointItems);

    await trx.commit(); //Sempre que se usa transaction, tem que ter isso aqui no final para que ele saiba que, uma vez que deu tudo certo, pode rodar as funções que estavam esperando
      
    return res.json({
      id: point_id,
      ... point //Esse ... é o spread operator, ou seja, vai retornar todas as propriedades do objeto point
    });
  }
}

export default PointsController;