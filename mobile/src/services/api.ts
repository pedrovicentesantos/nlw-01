import axios from 'axios';
import { BASE_URL } from "@env" ;

const api = axios.create({
  baseURL:`http://${process.env.BASE_URL}:3333/`
});

export default api;