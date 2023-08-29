import React from 'react';

const YoutubePlayer = (props) => {
  const videoSrc = `https://www.youtube.com/embed/${props.video}?autoplay=${props.autoplay}&rel=${props.rel}&modestbranding=${props.modest}`;
  return (
    <iframe
      title={props.title}
      className="player"
      type="text/html"
      width="100%"
      height="100%"
      src={videoSrc}
      frameBorder="0"
    />
  );
};

export default YoutubePlayer;
