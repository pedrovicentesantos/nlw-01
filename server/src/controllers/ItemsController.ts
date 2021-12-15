import { Request, Response} from 'express';
import knex from '../database/connection';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env')
});

class ItemsController {
  async index(request: Request, response: Response) {
    try {
      const items = await knex('items').select('*');
      const serializedItems = items.map(item => {
        return {
          id: item.id,
          title: item.title,
          image_url: `http://${process.env.BASE_URL}/uploads/${item.image}`
        }
      });
      return response.json(serializedItems);
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
}

export default ItemsController;