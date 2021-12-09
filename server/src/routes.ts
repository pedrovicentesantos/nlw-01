import express from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import { celebrate, Joi, Segments } from 'celebrate';

import PontosColetaController from './controllers/PontosColetaController';
import ItemsController from './controllers/ItemsController';

const pontosColetaController = new PontosColetaController();
const itemsController = new ItemsController();

const routes = express.Router();

const upload = multer(multerConfig);

routes.get('/items', itemsController.index);

routes.get('/pontosColeta', pontosColetaController.index);
routes.get(
  '/pontosColeta/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.number().required(),
    })
  }),
  pontosColetaController.show
);

routes.post(
  '/pontosColeta', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      number: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  },{
    abortEarly: false,
  }),
  pontosColetaController.create
);

export default routes;