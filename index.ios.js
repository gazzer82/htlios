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

    if (list.postHasImage){
    return (
      <View style={styles.posts}>
        <View style={styles.container}>
          <Text style={styles.userText}>@{list.postUserName}</Text>
          <Text style={styles.dateText}>{String(list.postDate)}</Text>
        </View>
        <View style={styles.container}>
          <ResponsiveImage
            source={{uri: list.postImageURL}}
            initWidth="394" initHeight="394"
            style={styles.canvas} />
        </View>
        <View style={styles.container}>
          <Text style={styles.bodyText}>{list.postText}</Text>
        </View>
      </View>
    );
    } else if (list.postHasVideo) {
      return (
        <View style={styles.container}>
          <Text style={styles.userText}>@{list.postUserName}</Text>
          <Text style={styles.dateText}>{String(list.postDate)}</Text>
          <Text style={styles.dateText}>{String(list.postVideoURL)}</Text>
          <Text style={styles.bodyText}>{list.postText}</Text>
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
    //justifyContent: 'center',
    //alignItems: 'left',
    backgroundColor: 'red',
    position: 'relative'
  },
  posts: {
    flex: 1, 
    flexDirection: 'column',
    padding: 20,
    //backgroundColor: 'red',
  },
  userText: {
    flex: 5,
    fontSize: 18,
  },
  bodyText: {
    flex: 5,
    fontSize: 16,
  },
  dateText: {
    flex: 5,
    fontSize: 16,
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
    //position: 'absolute',
    resizeMode: "contain",
    //width: 335,
    //height: 335,
    //top: 0,
    //left: 0,
    //bottom: 0,
    //right: 0,
    flex: 1,
  },
});
AppRegistry.registerComponent('htlios', () => htlios);
