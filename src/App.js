import { useState } from 'react';
import './App.css';
import AgoraRTC from 'agora-rtc-sdk';

var rtc = {
  client: null,
  joined: false,
  published: false,
  localStream: null,
  remoteStream: [],
  params: {}
};

function App() {

  // Options for joining a channel
  var option = {
    appID: "848a309347f1c7b21a115c061c56b9d5249f81be98401460e5ebb1654efd69ac",
    channel: "VPSHRQ",
    uid: null,
    token: "006691675e9948849f38fb50affc93556f8IAARCvqgsR3N8u4rScOB0KY0QcGj1nfc0vapEpG2ZooF7gKn1mAAAAAAIgDsbqo5bS8OYgQAAQD96wxiAgD96wxiAwD96wxiBAD96wxi",
  }


  const joinChannel = (role) => {
    // Create a client
    rtc.client = AgoraRTC.createClient({ mode: "live", codec: "h264" });


    rtc.client.init(option.appID, function () {
      console.log("init success");

      // Join a channel
      rtc.client.join(option.token ?
        option.token : null,
        option.channel, option.uid ? +option.uid : null, function (uid) {
          rtc.params.uid = uid;
          if (role === "host") {
            rtc.client.setClientRole("host");

            // Create a local stream
            rtc.localStream = AgoraRTC.createStream({
              streamID: rtc.params.uid,
              audio: true,
              video: true,
              screen: false,
              width: 3840,
              height: 2160,
              framerate: 60,
              bitrate: 600,
            });

            // Initialize the local stream
            rtc.localStream.init(function () {
              console.log("init local stream success");
              rtc.localStream.play("local_stream");
              rtc.client.publish(rtc.localStream, function (err) {
                console.log("publish failed");
                console.error(err);
              })

            }, function (err) {
              console.error("init local stream failed ", err);
            });

          }


          if (role === "audience") {

            // rtc.client.on("connection-state-change", function (evt) {
            //   console.log("audience", evt)
            // })

            rtc.client.on("stream-added", function (evt) {

              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              if (id !== rtc.params.uid) {
                rtc.client.subscribe(remoteStream, function (err) {
                  console.log("stream subscribe failed", err);
                })
              }
              console.log('stream-added remote-uid: ', id);
            });

            rtc.client.on("stream-removed", function (evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
            });

            rtc.client.on("stream-subscribed", function (evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              remoteStream.play("remote_vedio_");
            })

            rtc.client.on("stream-unsubscribed", function (evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              remoteStream.pause("remote_vedio_");
            })
          }
        }, function (err) {
          console.error("client join failed", err)
        })

    }, (err) => {
      console.error(err);
    });
  }

  const leaveEventHost = (params) => {
    rtc.client.unpublish(rtc.localStream, function (err) {
      console.log("publish failed");
      console.error(err);
    })
    rtc.client.leave(function (ev) {
      console.log(ev)
    })
  }

  const leaveEventAudience = (params) => {
    rtc.client.leave(function () {
      console.log("client leaves channel");
      //……
    }, function (err) {
      console.log("client leave failed ", err);
      //error handling
    })
  }

  return (
    <div className="App">
      <button onClick={() => joinChannel('host')}>Join Channel as host</button>
      <button onClick={() => joinChannel('audience')}>Join Channel as Audience</button>
      <button onClick={() => leaveEventHost('host')}>Leave Event host</button>
      <button onClick={() => leaveEventAudience('audience')}>Leave Event audience</button>
      <button onClick={(e) => { rtc.localStream.muteAudio() }}>mute audio</button>
      <button onClick={(e) => { rtc.localStream.unmuteAudio() }}>unmute audio</button>

      <button onClick={(e) => { rtc.localStream.muteVideo() }}>vedio</button>
      <button onClick={(e) => { rtc.localStream.unmuteVideo() }}>unmute vedio</button>

      <div id="local_stream" className="local_stream" style={{ width: '100%', height: '100vh' }}>
      </div>


      <div id="remote_vedio_" style={{ width: '100%', height: '100vh' }}>
      </div>

    </div >
  );
}

export default App;
