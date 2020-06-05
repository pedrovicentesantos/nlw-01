import { Request, Response, response} from 'express';
import knex from '../database/connection';

class PontosColetaController {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      number,
      city,
      uf,
      items,
    } = request.body;
  
    const trx = await knex.transaction();

    const pontoColeta = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      number,
      city,
      uf,
    }
  
    const insertedIds = await trx('pontosColeta').insert(pontoColeta);

    const pontoColeta_id = insertedIds[0];
  
    const pontoColetaItems = items
      .split(',')
      .map((item: string) => item.trim())
      .map((item: Number) => {
        return {
          item_id: item,
          pontoColeta_id,
        }
    });
  
    await trx('pontoColeta_items').insert(pontoColetaItems);
  
    await trx.commit();
  
    return response.json({
      id: pontoColeta_id,
      ...pontoColeta,
    })
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const pontoColeta = await knex('pontosColeta').where('id', id).first();

    if (!pontoColeta) {
      return response.status(400).json({ message: "Ponto de Coleta not found."})
    }

    const items = await knex('items')
      .join('pontoColeta_items', 'pontoColeta_items.item_id', '=', 'items.id')
      .where('pontoColeta_items.pontoColeta_id', id)
      .select('items.title');

    const serializedPontoColeta =  {
      ...pontoColeta,
      image_url: `http://192.168.0.13:3333/uploads/${pontoColeta.image}`
    }
    
    return response.json({pontoColeta: serializedPontoColeta, items})
  }

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    if (!city || !uf || !items) {
      const pontosColeta = await knex('pontosColeta').select('*');
      
      const serializedPontosColeta = pontosColeta.map(pontoColeta => {
        return {
          ...pontoColeta,
          image_url: `http://192.168.0.13:3333/uploads/${pontoColeta.image}`
        }
      });

      return response.json(serializedPontosColeta)
    }

    const parsedItems = String(items)
      .split(',')
      .map(item => {
        return Number(item.trim())
      });

    const pontosColeta = await knex('pontosColeta')
      .join('pontoColeta_items', 'pontosColeta.id', '=', 'pontoColeta_items.pontoColeta_id')
      .whereIn('pontoColeta_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('pontosColeta.*')

    const serializedPontosColeta = pontosColeta.map(pontoColeta => {
      return {
        ...pontoColeta,
        image_url: `http://192.168.0.13:3333/uploads/${pontoColeta.image}`
      }
    });

    return response.json(serializedPontosColeta)
  }
  
}

export default PontosColetaController;