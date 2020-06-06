import React, { useState, useEffect } from "react";
import { Feather as Icon, Ionicons } from "@expo/vector-icons";
import { View, ImageBackground, Image, StyleSheet, Text, TextInput} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';
import axios from "axios";

interface IBGEUFResponse {
	sigla: string
}

interface IBGECityResponse {
	nome: string
}

const Home = () => {
  const [ufs, setUFs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [selectedUf, setSelectedUf] = useState("0");
	const [selectedCity, setSelectedCity] = useState("0");

  const navigation = useNavigation();

  const placeholderUf = {
    label: "Selecione o Estado",
    value: null
  };

  const placeholderCity = {
    label: "Selecione a Cidade",
    value: null,
  };


  useEffect(() => {
    axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
    .then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUFs(ufInitials);
    })
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


  function handleNavigateToPoints() {
    navigation.navigate("Points", {
      selectedUf,
      selectedCity
    });
  }

  return (
		<ImageBackground 
			source={require("../../assets/home-background.png")} 
			style={styles.container}
			imageStyle={{ width: 274, height: 368 }}
		>
			<View style={styles.main}>
				<Image source={require("../../assets/logo.png")} />
				<Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
				<Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
			</View>

			<View style={styles.footer}>
        <RNPickerSelect
          useNativeAndroidPickerStyle={false}
          style={{
            inputAndroid: {
              backgroundColor: '#fff',
              marginBottom: 10,
              fontSize: 16,
              paddingHorizontal: 10,
              paddingVertical: 12,
              borderRadius: 8,
              paddingRight: 30, 
            }
          }}
          placeholder={placeholderUf}
          items={ufs.map(uf => {
              return ({
                label: uf,
                value: uf,
                key: uf                
              });
            })}
          onValueChange={value => {
              setSelectedUf(value);
            }
          }
        />
        <RNPickerSelect
          useNativeAndroidPickerStyle={false}
          style={{
            inputAndroid: {
              backgroundColor: '#fff',
              marginBottom: 16,
              fontSize: 16,
              paddingHorizontal: 10,
              paddingVertical: 12,
              borderRadius: 8,
              paddingRight: 30,
            }
          }}
          placeholder={placeholderCity}
          items={cities.map(city => {
            return ({
              label: city,
              value: city,
              key: city                
            });
          })}
          onValueChange={value => {
              setSelectedCity(value);
            }
          }
        />
				<RectButton style={styles.button} onPress={handleNavigateToPoints}>
					<View style={styles.buttonIcon}>
						<Text>
							<Icon name="arrow-right" color="#FFF" size ={24} />
						</Text>
					</View>
					<Text style={styles.buttonText}>
						Entrar
						</Text>
				</RectButton>
			</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
		padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home;