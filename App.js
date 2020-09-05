import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  TouchableHighlight,
  NativeModules,
  Text,
  DeviceEventEmitter,
  PermissionsAndroid
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  PROVIDER_GOOGLE
} from "react-native-maps";
import haversine from "haversine";
import Geolocation from '@react-native-community/geolocation';
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';


const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
// const LATITUDE = 37.78825;
// const LONGITUDE = -122.4324;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      routeCoordinates: [],
      distanceTravelled: 0,
      speed: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0
      })
    };
  }

  componentDidMount() {
    const { coordinate } = this.state;
    // Geolocation.requestAuthorization()
    // this.getCurrentLoc();
    this.requestLocationPermission();

    // console.log(NativeModules.LocationManager.JS_LOCATION_EVENT_NAME)
    this.subscription = DeviceEventEmitter.addListener(
      NativeModules.LocationManager.JS_LOCATION_EVENT_NAME,
      (e) => {
        console.log(
          // `Received Coordinates from native side at ${new Date(
          //   e.timestamp,
          // ).toTimeString()}: `,
          // e.latitude,
          // e.longitude,
          e,
        );

        const { routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude, } = e;

        // console.log(position.coords)
        const newCoordinate = {
          latitude,
          longitude
        };


        if (Platform.OS === "android") {
          if (this.marker) {
            // console.log(this.marker)
            this.marker.animateMarkerToCoordinate(
              newCoordinate,
              500
            );
          }
        } else {
          coordinate.timing(newCoordinate, { useNativeDriver: true }).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate,

        });

      },
    );

    // this.onEnableLocationPress();

    // this.watchID = Geolocation.watchPosition(
    //   position => {
    //     const { routeCoordinates, distanceTravelled } = this.state;
    //     const { latitude, longitude, speed } = position.coords;

    //     console.log(position.coords)
    //     const newCoordinate = {
    //       latitude,
    //       longitude
    //     };

    //     if (Platform.OS === "android") {
    //       if (this.marker) {
    //         // console.log(this.marker)
    //         this.marker.animateMarkerToCoordinate(
    //           newCoordinate,
    //           500
    //         );
    //       }
    //     } else {
    //       coordinate.timing(newCoordinate, { useNativeDriver: true }).start();
    //     }

    //     this.setState({
    //       latitude,
    //       longitude,
    //       routeCoordinates: routeCoordinates.concat([newCoordinate]),
    //       distanceTravelled:
    //         distanceTravelled + this.calcDistance(newCoordinate),
    //       prevLatLng: newCoordinate,
    //       speed: speed,
    //     });

    //   },
    //   error => console.log('error', error),
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 20000,
    //     maximumAge: 1000,
    //     distanceFilter: 10,
    //   }
    // );
  }


  requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Location Permission',
          'message': 'This App needs access to your location ' +
            'so we can know where you are.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

        console.log("You can use locations ")
       
      } else {
        console.log("Location permission denied")
      
      }
    } catch (err) {
      console.log(err)
     
    }
  }

  componentWillUnmount() {
    console.log('unmount')
    this.subscription.remove();
    // BackgroundGeolocation.removeAllListeners();

    // Geolocation.clearWatch(this.watchID);
  }

  onEnableLocationPress = async () => {
    // const { locationPermissionGranted, requestLocationPermission } = this.props;
    // if (this.requestLocationPermission()) {
    //   this.requestLocationPermission();
    //   if (granted) {
    //     return NativeModules.LocationManager.startBackgroundLocation();
    //   }
    // }
    // console.log(NativeModules)
    NativeModules.LocationManager.startBackgroundLocation();
  };

  onCancelLocationPress = () => {
    NativeModules.LocationManager.stopBackgroundLocation();
  };

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  render() {
    return (
      <View style={styles.container}>

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showUserLocation
          followUserLocation
          loadingEnabled
          region={this.getMapRegion()}
        >
          <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
          />
        </MapView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {parseFloat(this.state.distanceTravelled).toFixed(2)} km   {this.state.speed} km/h
            </Text>
          </TouchableOpacity>
        </View>

        <View >
          <TouchableHighlight style={styles.buttonContainer} onPress={this.onEnableLocationPress}>
            <Text >Enable Location</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.buttonContainer} onPress={this.onCancelLocationPress}>
            <Text >Cancel Location</Text>
          </TouchableHighlight>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  }
});

export default App;
