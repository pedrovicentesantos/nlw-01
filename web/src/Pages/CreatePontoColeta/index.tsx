import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import Dropzone from '../../components/Dropzone';
import PhoneInput from '../../components/PhoneInput';
import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const CreatePontoColeta = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    numero: 0
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setInitialPosition([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    api
      .get('items')
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then(response => {
        const siglasUfs = response.data.map(uf => {
          return uf.sigla;
        });
        setUfs(siglasUfs);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }
    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cities = response.data.map(city => {
          return city.nome;
        });
        setCities(cities);
      })
      .catch(error => {
        console.log(error);
      });
  }, [selectedUf]);

  function handleSelectUf(event:ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  function handleSelectCity(event:ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleMapChange(event:LeafletMouseEvent) {
    const latLong = event.latlng;
    setSelectedPosition([latLong.lat, latLong.lng]);
  }

  function handleFormDataChange(event:ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;
    setFormData({...formData, [name]: value});
  }

  function handleSelectedItems(id: number) {
    const alreadySelected = selectedItems.includes(id);
    if (!alreadySelected) {
      setSelectedItems([...selectedItems, id]);
    }
    else {
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems);
    }
  }

  async function handleSubmit(event:FormEvent) {
    try {
      event.preventDefault();
      const data = new FormData();
      data.append('email', formData.email);
      data.append('name', formData.name);
      data.append('whatsapp', formData.whatsapp);
      data.append('latitude', String(selectedPosition[0]));
      data.append('longitude', String(selectedPosition[1]));
      data.append('number', String(formData.numero));
      data.append('city', selectedCity);
      data.append('uf', selectedUf);
      data.append('items', selectedItems.join(','));
      if(selectedFile) {
        data.append('image', selectedFile);
      }
      await api.post('pontosColeta', data);
      alert('Ponto de Coleta criado!');
      history.push('/');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do<br />ponto de coleta</h1>
        <Dropzone onFileUploaded={setSelectedFile}/>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text" 
              name="name" 
              id="name"
              onChange={handleFormDataChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                name="email" 
                id="email"
                onChange={handleFormDataChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <PhoneInput handleChange={handleFormDataChange} />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapChange}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="numero">Número</label>
              <input 
                type="number" 
                min="1"
                name="numero" 
                id="numero"
                onChange={handleFormDataChange}
              />
            </div>
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                name="uf" 
                id="uf"
                onChange={handleSelectUf}
                value={selectedUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select 
              name="city" 
              id="city"
              onChange={handleSelectCity}
              value={selectedCity}
            >
              <option value="0">Selecione uma cidade</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de coleta</h2> 
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => {
              return (
                <li 
                  key={item.id} 
                  onClick={() => {handleSelectedItems(item.id)}}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title}/>
                  <span>{item.title}</span>
                </li>
              )
            })}
          </ul>
        </fieldset>
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}

export default CreatePontoColeta;