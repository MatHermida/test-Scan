const TVLChart2 = () => {
  return (
    <>
      <h1>Welcome to My Webpage</h1>

      <p>This is a paragraph of text.</p>

      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>

      <iframe
        width="100%"
        height="360px"
        src="https://defillama.com/chart/protocol/c3-exchange?tvl=true&volume=false&bridgeVolume=false&twitter=false&devMetrics=false&devCommits=false&groupBy=daily&theme=dark"
        title="Defillama"
        frameBorder="0"
        id="google-map-iframe"
      ></iframe>
    </>
  );
};

export default TVLChart2;