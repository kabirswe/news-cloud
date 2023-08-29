import React from 'react';

const VimeoPlayer = (props) => {
  const videoSrc = `https://player.vimeo.com/video/${props.video}`;
  return (
    <iframe
      title={props.title}
      src={videoSrc}
      className="player"
      width="100%"
      height="100%"
      // webkitallowfullscreen
      // mozallowfullscreen
      allowFullScreen
    />
  );
};

export default VimeoPlayer;
