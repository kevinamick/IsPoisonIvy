import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, ToastAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker';
import { Logs } from 'expo';

Logs.enableExpoCliLogging();


const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

function Button({ label, onPress, disabled }) {
  // ...rest of the code remains same
    return (
      <View>
        <Pressable
          style={[styles.button, { backgroundColor: '#fff' }]}
          onPress={onPress}    
          disabled={disabled}    
        >
          <Text>{label}</Text>
        </Pressable>
      </View>
    );
}

function ImageViewer({ selectedImage }) {
  const PlaceHolderImage = <Image
    source='./assets/images/OIP.jfif'
    placeholder={blurhash}
    contentFit="cover"
    transition={1000}
    style={{ width: 150, height: 150 }}
  />

  const imageSource = selectedImage !== null
    ? selectedImage
    : PlaceHolderImage;

  return <Image source={imageSource}
    contentFit="cover"
    transition={1000}
    style={{ width: 150, height: 150 }} />;
}

const App = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleChoosePhoto = async () => {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if(image) {
      setImage(image.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });    
    
    const response = await fetch('https://kamick-IsPoisonIvy.hf.space/run/predict', {
      method: 'POST',
      body: JSON.stringify({
        "data": ["data:image/jpg;base64," + base64],
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if(response?.ok) {
      const result = await response.json();
      setResult(result);      
      result.data[0].label ? 
        ToastAndroid.show("Poison Ivy Detected!", ToastAndroid.SHORT) : ToastAndroid.show("You're safe, this isn't poison ivy", ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(`Request failed with error code: ${response?.status}`, ToastAndroid.SHORT);      
    }   
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* <ImageViewer
          selectedImage={image}
        />         */}
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={handleChoosePhoto} label="Choose Photo" />
        <Button onPress={uploadImage} label="Test Photo" />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    borderRadius: 10,
    borderColor: '#333',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    margin: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
