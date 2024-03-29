import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Feather as Icon} from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as location from 'expo-location';

import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  image: string;
  image_url: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteParams {
  uf: string;
  city: string;
}

const Points = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);
  const route = useRoute();

  const {uf, city} = route.params as RouteParams;

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    async function loadLocation() {
      const {status} = await location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Oooops...', 'É necessário permissão para acessar a localização');
        return;
      }

      const userLocation = await location.getCurrentPositionAsync();

      setInitialPosition([userLocation.coords.latitude, userLocation.coords.longitude]);
    }

    loadLocation();
  }, []);

  useEffect(() => {
    api
      .get('/pontosColeta',{
        params: {
          city: city,
          uf: uf,
          items: selectedItems.join(', ') || undefined
        }
      })
      .then(response => {
        setPoints(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, [selectedItems]);

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate('Detail', { point_id: id});
  }

  function handleSelectedItems(id: number) {
    const alreadySelected = selectedItems.includes(id);
    if (!alreadySelected) {
      setSelectedItems([...selectedItems, id]);
    } else {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    }
  }
  
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34CB79" size={20} ></Icon>
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView 
              style={styles.map}
              initialRegion={{
                latitude:initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014
              }}
            >
              {points.map(point => {
                return (
                  <Marker 
                    key={String(point.id)}
                    style={styles.mapMarker}
                    coordinate={{
                      latitude:point.latitude,
                      longitude: point.longitude
                    }}
                    onPress={() => {handleNavigateToDetail(point.id)}}
                  >
                    <View style={styles.mapMarkerContainer}>
                      <Image 
                        style={styles.mapMarkerImage} 
                        source={{uri: point.image_url || 'http://cdn.onlinewebfonts.com/svg/img_211247.png'}} 
                      />
                      <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20
          }}
        >
          {items.map(item => {
            return (
              <TouchableOpacity 
                key={String(item.id)} 
                style={[
                  styles.item,
                  selectedItems.includes(item.id) ? styles.selectedItem : {}
                ]} 
                onPress={() => handleSelectedItems(item.id)}
                activeOpacity={0.6}
              >
                <SvgUri width={42} height={42} uri={item.image_url} />
                <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
            );
          })}
        </ScrollView>
        
      </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points;