import * as S from './styles';

const DesktopTVLChart = () => {
  return (
    <S.TVLChartContainer item>
      <S.TVLChartTitle item>Total Value Locked Chart</S.TVLChartTitle>
      <S.TVLChart>
        <iframe
          width="100%"
          height="360px"
          src="https://defillama.com/chart/protocol/c3-exchange?tvl=true&denomination=USD&theme=dark"
          title="C3"
          frameBorder="0"
        ></iframe>
      </S.TVLChart>
    </S.TVLChartContainer>
  );
};

export default DesktopTVLChart;