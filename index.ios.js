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
  TabBarIOS,
  ActivityIndicatorIOS,
} = React;

var _ = require('lodash');
var DDPClient = require("ddp-client");
var ResponsiveImage = require("react-native-responsive-image");
var Video = require('react-native-video');
var Device = require('react-native-device');
var prettydate = require("pretty-date");

var TabBarItemIOS = TabBarIOS.Item;
var SMXTabBarIOS = require('SMXTabBarIOS');
var SMXTabBarItemIOS = SMXTabBarIOS.Item;
var TimerMixin = require('react-timer-mixin');
var ddpClient;
var Button = require('react-native-button');

var htlios = React.createClass({
  mixins: [TimerMixin],
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => !_.isEqual(row1, row2),
      }),
      loaded: false,
      selectedTab: 'new',
      notifCount: 0,
      presses: 0,
      connectionState: 'Loading posts, please wait . . . .'
    };
  },

  componentDidMount: function() {

    this.connectMeteor();

  },

  reconnectCallback: function(){
  mixins: [TimerMixin],
    this.setTimeout(
      () => { this.connectMeteor();},
      500
    );
  },

  componentWillUpdate: function(nextProps, nextState) {
    if(this.state.selectedTab != nextState.selectedTab){
      //this.updateSubscription();
      //this.connectMeteor();
    }
    //console.log(this.state);
    //console.log(nextState);
  },

  connectMeteor: function() {

  ddpClient = new DDPClient({url: 'ws://localhost:3000/websocket'});
  var that = this;
  Object.observe(ddpClient, function(changes){
    changes.forEach(function(change){
      if(change.name == '_connectionFailed' && change.object._connectionFailed === true){
        that.reconnectCallback();
        console.log('connection failed');
        console.log(change);
        that.setState({
              connectionState: 'Connection Error, retrying . . . .',
        });
      }
    
          //that.reconnectCallback();
    });
  });

  ddpClient.connect(function(error, wasReconnect) {
    // If autoReconnect is true, this callback will be invoked each time
    // a server connection is re-establishe
    if (error) {
      console.log('DDP connection error!');
      console.log(ddpClient);
      return;
    }

    console.log(ddpClient);

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
      'socialPostsiOS',                  // name of Meteor Publish function to subscribe to
      //[that.state.selectedTab , 10],
      [10],                        // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        console.log('posts complete:');
        //console.log(ddpClient.collections.socialposts);
      }
    );

    console.log(ddpClient);

    if (wasReconnect) {
      console.log('Reestablishment of a connection.');
    }

    console.log('connected!');

    });

    if(ddpClient._connectionFailed === true){
      console.log('connection failed');
    }

    // observe the lists collection
    var observer = ddpClient.observe("socialposts");
    observer.added = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.socialposts)));
    observer.changed = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.socialposts)));
    observer.removed = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.socialposts)));
  
  },

  updateSubscription: function () {
      ddpClient.collections = null;
      console.log(ddpClient);
      console.log('changing subscription');
      ddpClient.subscribe(
      'socialPostsApproved',                  // name of Meteor Publish function to subscribe to
      [10],                      // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        //console.log('posts complete:');
        //console.log(ddpClient.collections.socialposts);
      }
    );
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
      <SMXTabBarIOS
        selectedTab={this.state.selectedTab}
        tintColor={'#F10CD2'}
        barTintColor={'#000000'}
        styles={styles.tabBar}>
        <SMXTabBarItemIOS
          name="new"
          iconName={'ion|ios-plus-outline'}
          title={''}
          iconSize={32}
          accessibilityLabel="New Tab"
          selected={this.state.selectedTab === 'new'}
          onPress={() => {
            this.setState({
              selectedTab: 'new',
            });
          }}>
          <ListView
                dataSource={this.state.dataSource}
                renderRow={this.renderList}
                style={styles.listView}
          />
        </SMXTabBarItemIOS>
        <SMXTabBarItemIOS
            name="approved"
            iconName={'ion|ios-checkmark-outline'}
            title={''}
            iconSize={32}
            accessibilityLabel="Approved Tab"
            selected={this.state.selectedTab === 'approved'}
            onPress={() => {
            this.setState({
              selectedTab: 'approved',
            });
          }}>
          <ListView
                dataSource={this.state.dataSource}
                renderRow={this.renderList}
                style={styles.listView}
          />
        </SMXTabBarItemIOS>
        <SMXTabBarItemIOS
            name="deleted"
            iconName={'ion|ios-close-outline'}
            title={''}
            iconSize={32}
            accessibilityLabel="Deleted Tab"
            selected={this.state.selectedTab === 'deleted'}
            onPress={() => {
            this.setState({
              selectedTab: 'deleted',
            });
          }}>
          <ListView
                dataSource={this.state.dataSource}
                renderRow={this.renderList}
                style={styles.listView}
          />
        </SMXTabBarItemIOS>
      </SMXTabBarIOS>
    );
  },

  onPressTab: function(name) {
    this.setState({name: name});
   },

  renderLoadingView: function() {
    var statusText = this.state.connectionState
    return (
      <View style={styles.loadingContainer}>
        <Image
              source={require('image!splash')}
              style={styles.loadingContainerImage} />
        <View style={styles.loadingInner}>
          <ActivityIndicatorIOS
            animating={this.state.animating}
            style={[styles.centering, {height: 80}]}
            size="large"
          />
          <Text style={styles.loadingText}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  },

  renderList: function(list) {
    var postType = 'text'
    if (list.postHasVideo) {
      var postType = 'video'
    } else if (list.postHasImage){
      var postType = 'image'
    }if (list.postStatus == this.state.selectedTab){
      return (
        <View style={styles.posts}>
          <PostHeader postType={postType} postUserName={list.postUserName} postDate={list.postDate} postUserImageURL={list.postUserImageURL}/>
          <PostVideo postType={postType} postVideoURL={list.postVideoURL} />
          <PostImage postType={postType} postImageURL={list.postImageURL} />
          <PostBody postType={postType} postText={list.postText} />
          <PostButtons postStatus={list.postStatus} _id={list._id} />
        </View>
      );
    } else {
      return null;
    }
  },

});

var PostVideo = React.createClass({
  render: function() {
    if (this.props.postType == 'video'){
      return (
          <View style={styles.videoContainer}>
            <Video source={{uri: this.props.postVideoURL}} // Can be a URL or a local file.
              rate={1.0}                   // 0 is paused, 1 is normal.
              volume={1.0}                 // 0 is muted, 1 is normal.
              muted={false}                // Mutes the audio entirely.
              paused={true}               // Pauses playback entirely.
              resizeMode="cover"           // Fill the whole screen at aspect ratio.
              repeat={true}                // Repeat forever.
              style={styles.backgroundVideo} />
          </View>
      );
    } else {
      return null
    }
  }
});

var PostImage = React.createClass({
  render: function() {
    if (this.props.postType == 'image'){
      return (
          <View style={styles.container}>
            <ResponsiveImage
              source={{uri: this.props.postImageURL}}
              initWidth="94" initHeight="94"
              style={styles.canvas} />
          </View>
      );
    } else {
      return null
    }
  }
});

var PostHeader = React.createClass({
  render: function() {
    return (
      <View style={styles.headerContainer}>
        <UserImage postUserImageURL={this.props.postUserImageURL}/>
        <View style={styles.headerContainerLeft}>
          <Text style={styles.userText}>@{this.props.postUserName}</Text>
          <Text style={styles.dateText}>{String(prettydate.format(this.props.postDate))}</Text>
        </View>
      </View>
    );
  }
});

var PostBody = React.createClass({
  render: function() {
    return (
      <View style={styles.videoContainer}>
          <Text style={styles.bodyText}>{this.props.postText}</Text>
      </View>
    );
  }
});

var PostButtons = React.createClass({
  render: function() {
    if (this.props.postStatus == 'new'){
      return (
        <View style={styles.postButtonsContainer}>
          <ApproveButton _id={this.props._id}/>
          <DeleteButton _id={this.props._id}/>
        </View>
      );
    } else if (this.props.postStatus == 'approved'){
      return (
        <View style={styles.postButtonsContainer}>
          <DeleteButton _id={this.props._id}/>
        </View>
      );
    } else {
      return (
        <View style={styles.postButtonsContainer}>
          <ApproveButton _id={this.props._id}/>
        </View>
      );
    }
  },
});

var ApproveButton = React.createClass({
  render: function() {
    return (
        <Button style={styles.postButtonsApprove} onPress={this.handlePress}>
          Approve
        </Button>
    );
  },
  handlePress: function(event) {
    console.log('Approve post id ' + this.props._id);
    var that = this;
      //setTimeout(function () {
      /*
       * Call a Meteor Method
       */
        //console.log(ddpClient);
        ddpClient.call(
          'approvePost',             // name of Meteor Method being called
          [that.props._id],            // parameters to send to Meteor Method
          function (err, result) {   // callback which returns the method call results
            console.log('approving post, result: ' + result + err);
          },
          function () {              // callback which fires when server has finished
            console.log('updated');  // sending any updated documents as a result of
            //console.log(ddpclient.collections.posts);  // calling this method
          }
        );
    //}, 3000);
  },
});

var DeleteButton = React.createClass({
  render: function() {
    return (
        <Button style={styles.postButtonsDelete} onPress={this.handlePress}>
          Delete
        </Button>
    );
  },
  handlePress: function(event) {
      console.log('Delete post id ' + this.props._id);
      var that = this;
      //setTimeout(function () {
      /*
       * Call a Meteor Method
       */
        //console.log(ddpClient);
        ddpClient.call(
          'deletePost',             // name of Meteor Method being called
          [that.props._id],            // parameters to send to Meteor Method
          function (err, result) {   // callback which returns the method call results
            console.log('approving post, result: ' + result + err);
          },
          function () {              // callback which fires when server has finished
            console.log('updated');  // sending any updated documents as a result of
            //console.log(ddpclient.collections.posts);  // calling this method
          }
        );
    //}, 3000);
  },
});

var UserImage = React.createClass({
  render: function() {
    return (
        <View style={styles.userProfileImage}>
          <ResponsiveImage
            source={{uri: this.props.postUserImageURL}}
            initWidth="50" initHeight="50"
            style={styles.userProfileImage} />
        </View>
    );
  }
});
        

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  loadingContainerImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch
  },
  loadingInner: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: (Device.height/2) - 50,
    left: 0,
    backgroundColor: 'transparent',
    width: Device.width,
    height: 100,
  },
  loadingText: {
    backgroundColor: 'transparent',
  },
  posts: {
    flex: 1, 
    //flexDirection: 'column',
    padding: 10,
    backgroundColor: '#C0C0C0',
  },
  userText: {
    //flex: 5,
    fontSize: 14,
    //padding: 5,
  },
  bodyText: {
    //flex: 5,
    fontSize: 14,
    padding: 5,
  },
  dateText: {
    //flex: 5,
    fontSize: 10,
    //padding: 5,
  },
  postButtonsContainer: {
    flex: 1,
    //fontSize: 10,
    padding: 5,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  postButtonsApprove: {
    color: 'green',
    padding: 5,
  },
  postButtonsDelete: {
    color: 'red',
    padding: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainerLeft: {
    flexDirection: 'column',
    paddingTop: 5,
    flex: 1,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  videoContainer: {
    flex: 1,
    paddingLeft: 5,
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    resizeMode: "contain",
    flex: 1,
  },
  userProfileImage: {
    //flex: 1,
    padding: 5,
  },
  backgroundVideo: {
    //position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: (Device.width - 30),
    width: (Device.width - 30),
  },
});
AppRegistry.registerComponent('htlios', () => htlios);
