import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Feather as Icon, FontAwesome} from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';

import * as MailComposer from 'expo-mail-composer';

import api from '../../services/api';

interface RouteParams {
  point_id: number
}

interface PointDetail {
  pontoColeta: {
    image: string;
    image_url: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
    number: number
  };
  items: {
    title: string
  }[]
}

const Detail = () => {
  const navigation = useNavigation();

  const [pointDetail, setPointDetail] = useState<PointDetail>({} as PointDetail);

  const route = useRoute();

  const {point_id} = route.params as RouteParams;

  function handleNavigateBack() {
    navigation.goBack();
  }

  useEffect(() => {
    api.get(`pontosColeta/${point_id}`).then(response => {
      setPointDetail(response.data);
    })
  },[]);

  function handleComposeEmail() {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [pointDetail.pontoColeta.email]
    });
  }

  function handleWhatsapp() {
    Linking.openURL(`whatsapp://send?phone=${pointDetail.pontoColeta.whatsapp}&text=Tenho interesse sobre coleta de resíduos`);
  }

  if (!pointDetail.pontoColeta) {
    return null;
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34CB79" size={20} ></Icon>
        </TouchableOpacity>
        <Image style={styles.pointImage} source={{uri:pointDetail.pontoColeta.image_url || 'http://cdn.onlinewebfonts.com/svg/img_211247.png'}} />
        <Text style={styles.pointName}>{pointDetail.pontoColeta.name}</Text>
        <Text style={styles.pointItems}>{pointDetail.items.map(item => item.title).join(', ')}</Text>

        <View style={styles.address} >
          <Text style={styles.addressTitle} >Endereço</Text>
          <Text style={styles.addressContent}>{pointDetail.pontoColeta.city}, {pointDetail.pontoColeta.uf} </Text>
          <Text style={styles.addressContent}>Nº {pointDetail.pontoColeta.number}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome name="whatsapp" size={20} color="#FFF"/>
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleComposeEmail}>
          <Icon name="mail" size={20} color="#FFF"/>
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },
  
  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});

export default Detail;