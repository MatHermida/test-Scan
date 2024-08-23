import { useEffect, useRef, useState } from 'react';
import * as S from './styles';

const TVLChart = () => {
  const [shouldShowIframe, setShouldShowIframe] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe: any = iframeRef.current;
    console.log('iframe', iframe);

    try {
      const aux: any = iframe;
      var innerDoc = aux?.contentWindow.document
        ? aux?.contentWindow.document
        : aux?.contentDocument;
      const canvasElements = innerDoc.getElementsByTagName('canvas');

      if (!canvasElements.length) {
        // setShouldShowIframe(false);
        console.log('no canvas elements');
      } else {
        setShouldShowIframe(true);
        console.log('canvas elements');
      }
    } catch (error) {
      console.error("Error accessing iframe's content:", error);
      // setShouldShowIframe(false);
    }

    // const checkForCanvasElement = () => {
    //   try {
    //     const aux: any = iframe;
    //     var innerDoc = (aux.contentWindow.document) ? aux.contentWindow.document : aux.contentDocument ;
    //     const canvasElements = innerDoc.getElementsByTagName('canvas');

    //     if (!canvasElements.length) {
    //       setShouldShowIframe(false);
    //     } else {
    //       setShouldShowIframe(true);
    //     }
    //   } catch (error) {
    //     console.error("Error accessing iframe's content:", error);
    //     setShouldShowIframe(false);
    //   }
    // };
    // iframe?.addEventListener('load', checkForCanvasElement);
    // return () => {
    //   iframe?.removeEventListener('load', checkForCanvasElement);
    // };
  }, [iframeLoaded]);

  if (!shouldShowIframe) {
    return <></>;
  }

  return (
    <S.TVLChartContainer item mobile={12}>
      <S.TVLChartTitle item>
        <span>Total Value Locked</span>
        <S.DefiLlamaURL
          href="https://defillama.com/protocol/c3-exchange"
          target="_blank"
          rel="noopener noreferrer"
        >
          C3 DefiLlama page
        </S.DefiLlamaURL>
      </S.TVLChartTitle>
      <S.TVLChart>
        <iframe
          ref={iframeRef}
          id="my-iframe"
          width="100%"
          height="360px"
          src="https://defillama.com/chart/protocol/c3-exchange?tvl=true&denomination=USD&theme=dark"
          title="C3"
          frameBorder="0"
          onLoad={() => {
            console.log('iframe loaded');
            setIframeLoaded(true);
          }}
        ></iframe>
      </S.TVLChart>
    </S.TVLChartContainer>
  );
};

export default TVLChart;
