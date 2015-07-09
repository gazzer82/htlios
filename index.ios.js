/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} = React;

var _ = require('lodash');
var DDPClient = require("ddp-client");
var ResponsiveImage = require("react-native-responsive-image");
var Video = require('react-native-video');
var Device = require('react-native-device');

var htlios = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => !_.isEqual(row1, row2),
      }),
      loaded: false,
    };
  },

  componentDidMount: function() {
    var ddpClient = new DDPClient({url: 'ws://localhost:3000/websocket'});

    //ddpClient.connect(() => ddpClient.subscribe('publicLists'));
    /*
 * Connect to the Meteor Server
 */
  ddpClient.connect(function(error, wasReconnect) {
    // If autoReconnect is true, this callback will be invoked each time
    // a server connection is re-established
    if (error) {
      console.log('DDP connection error!');
      return;
    }
    ddpClient.call("login", [
        { user : { email : "admin@htl.com" }, password : "vertbaudet" }
        ], function (err, result) { 
          if(err){
            console.log('Login Error');
            console.log(err);
          } else {
            console.log('Login Successfull');
            console.log(result);
          }
    });
    ddpClient.subscribe(
      'socialPostsFiltered',                  // name of Meteor Publish function to subscribe to
      ['new', 10],                       // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        console.log('posts complete:');
        console.log(ddpClient.collections.socialposts);
      }
    );

    if (wasReconnect) {
      console.log('Reestablishment of a connection.');
    }

    console.log('connected!');

});

    // observe the lists collection
    var observer = ddpClient.observe("socialposts");
    observer.added = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.socialposts)));
    observer.changed = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.socialposts)));
    observer.removed = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.socialposts)));
  },

  updateRows: function(rows) {
    this.setState({
     dataSource: this.state.dataSource.cloneWithRows(rows),
     loaded: true,
   });
  },

  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderList}
        style={styles.listView}
      />
    );
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading lists...
        </Text>
      </View>
    );
  },

  renderList: function(list) {
    if (list.postHasVideo) {
    return (
      <View style={styles.posts}>
        <View style={styles.container}>
          <Text style={styles.userText}>@{list.postUserName}</Text>
          <Text style={styles.dateText}>{String(list.postDate)}</Text>
        </View>
        <View style={styles.container}>
          <Video source={{uri: list.postVideoURL}} // Can be a URL or a local file.
            rate={1.0}                   // 0 is paused, 1 is normal.
            volume={1.0}                 // 0 is muted, 1 is normal.
            muted={false}                // Mutes the audio entirely.
            paused={true}               // Pauses playback entirely.
            resizeMode="cover"           // Fill the whole screen at aspect ratio.
            repeat={true}                // Repeat forever.
             //onLoadStart={this.loadStart} // Callback when video starts to load
             //onLoad={this.setDuration}    // Callback when video loads
             //onProgress={this.setTime}    // Callback every ~250ms with currentTime
             //onEnd={this.onEnd}           // Callback when playback finishes
             //onError={this.videoError}    // Callback when video cannot be loaded
            style={styles.backgroundVideo} />
        </View>
        <View style={styles.container}>
          <Text style={styles.bodyText}>{list.postText}</Text>
        </View>
      </View>
    );
    } else if (list.postHasImage){
    return (
      <View style={styles.posts}>
        <View style={styles.container}>
          <Text style={styles.userText}>@{list.postUserName}</Text>
          <Text style={styles.dateText}>{String(list.postDate)}</Text>
        </View>
        <View style={styles.container}>
          <ResponsiveImage
            source={{uri: list.postImageURL}}
            initWidth="404" initHeight="404"
            style={styles.canvas} />
        </View>
        <View style={styles.container}>
          <Text style={styles.bodyText}>{list.postText}</Text>
        </View>
      </View>
    );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.userText}>@{list.postUserName}</Text>
          <Text style={styles.dateText}>{String(list.postDate)}</Text>
          <Text style={styles.bodyText}>{list.postText}</Text>
        </View>
      );
    }
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#FFFFFF',
    //position: 'relative'
  },
  posts: {
    flex: 1, 
    //flexDirection: 'column',
    padding: 10,
    backgroundColor: '#C0C0C0',
  },
  userText: {
    flex: 5,
    fontSize: 18,
    padding: 5,
  },
  bodyText: {
    flex: 5,
    fontSize: 16,
    padding: 5,
  },
  dateText: {
    flex: 5,
    fontSize: 16,
    padding: 5,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'stretch',
  },
  canvas: {
    resizeMode: "contain",
    flex: 1,
  },
    backgroundVideo: {
    //position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: (Device.width - 20),
    width: (Device.width - 20),
    paddingTop: 5,
  },
});
AppRegistry.registerComponent('htlios', () => htlios);
