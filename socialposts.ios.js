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
} = React;

var _ = require('lodash');
var DDPClient = require("ddp-client");
var ResponsiveImage = require("react-native-responsive-image");
var Video = require('react-native-video');
var Device = require('react-native-device');
var prettydate = require("pretty-date");
var New = require('./socialposts.ios');
var Approved = require('./socialposts.ios');

var TabBarItemIOS = TabBarIOS.Item;
 
class socialposts extends Component {
  render() {
    var postType = 'text'
    if (list.postHasVideo) {
      var postType = 'video'
    } else if (list.postHasImage){
      var postType = 'image'
    }
    return (
      <View style={styles.posts}>
        <PostHeader postType={postType} postUserName={list.postUserName} postDate={list.postDate} postUserImageURL={list.postUserImageURL}/>
        <PostVideo postType={postType} postVideoURL={list.postVideoURL} />
        <PostImage postType={postType} postImageURL={list.postImageURL} />
        <PostBody postType={postType} postText={list.postText} />
        <TabBarIOS selectedTab={this.state.selectedTab}>
          <TabBarIOS.Item
            selected={this.state.selectedTab === 'welcome'}
            icon={{uri:'featured'}}
            onPress={() => {
                this.setState({
                    selectedTab: 'welcome',
                });
            }}>
          </TabBarIOS.Item>
          <TabBarIOS.Item
            selected={this.state.selectedTab === 'more'}
            icon={{uri:'contacts'}}
            onPress={() => {
                  this.setState({
                      selectedTab: 'more',
                  });
            }}>
          </TabBarIOS.Item>
        </TabBarIOS>
      </View>
    );
  }
}
 
module.exports = socialposts;


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
AppRegistry.registerComponent('socialposts', () => htlios);
