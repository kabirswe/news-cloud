import React from 'react';

const HtmlPlayer = (props) => {
  return (
    <video key={props.videoId} width="585" height="100%" controls autoPlay loop>
      <source src={props.video} type="video/mp4" />
      <source src={props.video} type="video/mpeg4" />
      <source src={props.video} type="video/mov" />
      <source src={props.video} type="video/avi" />
      <source src={props.video} type="video/ogg" />
      <source src={props.video} type="video/webm" />
      <track kind="subtitles" />
      Your browser does not support the video tag.
    </video>
  );
};

export default HtmlPlayer;
