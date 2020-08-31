import React, { Component } from 'react';

import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Button,
} from 'react-native';

import MapView from 'react-native-maps';
// navigator.geolocation = require('@react-native-community/geolocation');
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window')

const SCREEN_HEIGHT = height
const SCREEN_WIDTH = width
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0080
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

class MapComponent extends Component {
  constructor() {
    super()
    this.state = {
      initialPosition: {
        latitude: 21.1458,
        longitude: 79.0882,
        latitudeDelta: 0.1550,
        longitudeDelta: 0,
      },
      markers: [],
      enableSet: true
    }

  }

  getCurrentLoc = () => {
    Geolocation.getCurrentPosition((position) => {

      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)

      var initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
      // console.log(initialRegion)
      this.props.setLatLong(lat, long)

      this.setState({ enableSet: false, initialPosition: initialRegion, markers: [{ latlng: initialRegion }] })
    },
      (error) => alert('Error: ' + error.message),
      { enableHighAccuracy: true, timeout: 20000, });
  }

  componentDidMount() {
    // this.getCurrentLoc();
  }

  renderScreen = () => {
    return (

      <View style={styles.container}>

        <MapView
          style={styles.map}
          region={this.state.initialPosition}

          onPress={(e) => {
            // this.setState({ markers: [{ latlng: e.nativeEvent.coordinate }] })
            // console.log(e.nativeEvent)
            var initialRegion = {
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }
            this.setState({ enableSet: false, initialPosition: initialRegion, markers: [{ latlng: e.nativeEvent.coordinate }] })
            this.props.setLatLong(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)
          }}
        >
          {
            this.state.markers.map((marker, i) => (
              <MapView.Marker key={i} coordinate={marker.latlng} />
            ))
          }
        </MapView>

        <View style={{
          position: 'absolute',
          borderRadius: 30,
          top: 10,
          right: 10,
          padding: 5,
          backgroundColor: 'black',
          opacity: .75,
          alignItems: 'center'
        }}>

          <TouchableOpacity onPress={() => this.props.closeMap()} >
            <Text style={{ color: 'white', fontSize:20, }}>  X  </Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: '#e4e4e4' }}>
          <Text > Tap to set Location</Text>
        </View>

        {this.renderBody()}
      </View>

    );
  }

  renderBody = () => {
    return (
      <View style={{ flexDirection: 'row', paddingBottom: 10, }}>

        <Button
          title='Get current Location'
          onPress={() => this.getCurrentLoc()}
        />
        <View style={{ margin: 5, }} />
        <Button
          disabled={this.state.enableSet}
          title='Set this Location'
          onPress={() => {
            
            this.props.hideMap()}}
        />
      </View>
    )
  }

  render() {
    return (

      this.renderScreen()


    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 4,
    elevation: 4,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: 20,

  },
  close: {
    position: 'absolute',
    height: 20,
    width: 20,
    borderRadius: 20,
    top: 10,
    right: 10,
    padding: 20,
    backgroundColor: 'black'
  }
});

export default MapComponent;