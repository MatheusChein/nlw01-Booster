import React, {useEffect, useState, ChangeEvent, FormEvent} from "react";
import {Link, useHistory} from "react-router-dom";
import {FiArrowLeft} from "react-icons/fi";
import {Map, TileLayer, Marker} from "react-leaflet";
import axios from "axios";
import {LeafletMouseEvent} from "leaflet";
import api from "../../services/api";

import Dropzone from "../../components/dropzone";

import "./styles.css";

import logo from "../../assets/logo.svg";

interface Item {
	id: number,
	title: string,
	image_url: string
};

interface IBGEUFResponse {
	sigla: string
}

interface IBGECityResponse {
	nome: string
}

const CreatePoint = () => {
	const [items, setItems] = useState<Item[]>([]); //Criamos o estado inicial com um array vazio
	const [ufs, setUFs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [initialMapPosition, setInitialMapPosition] = useState<[number, number]>([0, 0]);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		whatsapp: ""
	});

	const [selectedUf, setSelectedUf] = useState("0");
	const [selectedCity, setSelectedCity] = useState("0");
	const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([0, 0]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [selectedFile, setSelectedFile] = useState<File>();

	const history = useHistory();
	
	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const {latitude, longitude} = position.coords;
			setInitialMapPosition([latitude, longitude]);
		});
	}, []);

	useEffect(() => { //O useEffect() recebe dois parâmetros: uma função e quando que é para ser chamada essa função, isto é, quando o estado for alterado. Então, deixando vazio com [], essa função vai ser disparada uma única vez, independente de quantas vezes o componente CreatePoint() mude.
		api.get("items").then(response => {
			setItems(response.data);
		});
	}, []);

	useEffect(() => {
		axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
		.then(response => {
			const ufInitials = response.data.map(uf => uf.sigla);
			setUFs(ufInitials);
		});
	}, []);

	useEffect(() => {
		//Precisamos carregar as cidades toda vez que o usuário selecionar uma cidade diferente
		if (selectedUf === "0") {
			return;
		}
		axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
		.then(response => {
			const cityNames = response.data.map(city => city.nome);

			setCities(cityNames);
		});
		
	}, [selectedUf]);

	function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		setSelectedUf(uf);
	}

	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		setSelectedCity(city);
	}

	function handleMapClick(event: LeafletMouseEvent) {
		setSelectedMapPosition([
			event.latlng.lat,
			event.latlng.lng
		]);		
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const {name, value} = event.target;
		setFormData({...formData, [name]: value} ) //Colchetes no name para poder usar uma variável como o nome de uma propriedade
	}	

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex(item => item === id); //Se não achar o id no array, o findIndex retorna -1
		
		if (alreadySelected >= 0) {
			const filteredItems = selectedItems.filter(item => item !== id);
			setSelectedItems(filteredItems);
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const {name, email, whatsapp} = formData;
		const uf = selectedUf;
		const city = selectedCity;
		const [latitude, longitude] = selectedMapPosition;
		const items = selectedItems;

		const data = new FormData();

		data.append("name", name);
		data.append("email", email);
		data.append("whatsapp", whatsapp);
		data.append("uf", uf);
		data.append("city", city);
		data.append("latitude", String(latitude));
		data.append("longitude", String(longitude));
		data.append("items", items.join(","));
		
		if (selectedFile) {
			data.append("image", selectedFile);
		}

		await api.post("/points", data);

		alert("Ponto cadastrado com sucesso!")

		history.push("/");		
	}

  return (
    <div id="page-create-point">
    	<header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para a Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

				<Dropzone onFileUploaded={setSelectedFile} />

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
							onChange={handleInputChange}
						/>
          </div>

          <div className="field-group">

            <div className="field">
              <label htmlFor="email">E-mail</label>
							<input
								type="email"
								name="email"
								id="email"
								onChange={handleInputChange}
							/>
            </div>

            <div className="field">    
              <label htmlFor="whatsapp">Whatsapp</label>
							<input 
								type="text" 
								name="whatsapp" 
								id="whatsapp"
								onChange={handleInputChange}
							/>
            </div>

          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
          </legend>

					<Map center={initialMapPosition} zoom={15} onClick={handleMapClick}>
						<TileLayer  
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         		/>
						<Marker position={selectedMapPosition}/>
					</Map>

					<div className="field-group">

					<div className="field">
						<label htmlFor="uf">Estado (UF)</label>
						<select 
							name="uf" 
							id="uf" 
							value={selectedUf}
							onChange={handleSelectUf}
						>
							<option value="0">Selecione um estado</option>
							{ufs.map(uf => {
								return <option key={uf} value={uf}>{uf}</option>;
							})}
						</select>
					</div>

					<div className="field">
						<label htmlFor="city">Cidade</label>
						<select 
							name="city" 
							id="city"
							value={selectedCity}
							onChange={handleSelectCity}
						>
							<option value="0">Selecione uma cidade</option>
							{cities.map(city => {
								return <option key={city} value={city}>{city}</option>;
							})}
						</select>
					</div>

					</div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
          </legend>

					<ul className="items-grid">
						{items.map(item => {
							return <li 
												key={item.id} 
												onClick={() => handleSelectItem(item.id)}
												className={selectedItems.includes(item.id)? "selected" : ""}
											>
							<img src={item.image_url} alt={item.title}/>
							<span>{item.title}</span>
							</li>
						})}
					</ul>
        </fieldset>

				<button type="submit">
					Cadastrar ponto de coleta
				</button>
      </form>
    </div>
  )
};

export default CreatePoint;