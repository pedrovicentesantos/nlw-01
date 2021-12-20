import { Request, Response } from 'express';
import knex from '../database/connection';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env')
});

class PontosColetaController {
  private generateImageUrl(image: string) {
    return `http://${process.env.BASE_URL}/uploads/${image}`;
  }

  create = async (request: Request, response: Response) => {
    try {
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
      const pontoColeta = {
        image: request.file?.filename || '',
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        number,
        city,
        uf,
      };
      const trx = await knex.transaction();
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
      });
    } catch (error: any) {
      return response.status(500).json({error: error.message});
    }
  }

  show = async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const pontoColeta = await knex('pontosColeta').where('id', id).first();

      if (!pontoColeta) {
        return response.status(404).json({message: "Ponto de Coleta not found."});
      }
  
      const items = await knex('items')
        .join('pontoColeta_items', 'pontoColeta_items.item_id', '=', 'items.id')
        .where('pontoColeta_items.pontoColeta_id', id)
        .select('items.title');
      const serializedPontoColeta =  {
        ...pontoColeta,
        image_url: pontoColeta.image ? this.generateImageUrl(pontoColeta.image) : '',
      }
      return response.json({pontoColeta: serializedPontoColeta, items});
    } catch (error: any) {
      return response.status(500).json({error: error.message});
    }
  }

  index = async (request: Request, response: Response) => {
    try {
      const { city, uf, items } = request.query;
      // Not filter if any of the parameters is empty
      if (!city || !uf || !items) {
        const pontosColeta = await knex('pontosColeta').select('*');
        const serializedPontosColeta = pontosColeta.map(pontoColeta => {
          return {
            ...pontoColeta,
            image_url: pontoColeta.image ? this.generateImageUrl(pontoColeta.image) : '',
          }
        });
        return response.json(serializedPontosColeta);
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
        .select('pontosColeta.*');
      const serializedPontosColeta = pontosColeta.map(pontoColeta => {
        return {
          ...pontoColeta,
          image_url: pontoColeta.image ? this.generateImageUrl(pontoColeta.image) : '',
        }
      });
      return response.json(serializedPontosColeta);
    } catch (error: any) {
      return response.status(500).json({error: error.message});
    }
  }
}

export default PontosColetaController;
