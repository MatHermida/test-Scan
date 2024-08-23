import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Explorer from '../pages/Explorer/Explorer';
import Decoder from '../pages/Decoder/Decoder';
import { AppRoutes } from './routes';

const PersistQueryParam = ({ shouldPersist }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (shouldPersist && !queryParams.has('env')) {
      queryParams.set('env', 'test');
      navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
    }
  }, [location, navigate, shouldPersist]);

  return (
    <Routes>
      <Route path={AppRoutes.EXPLORER} element={<Explorer />} />
      <Route path={AppRoutes.DECODER} element={<Decoder />} />
      <Route
        path="/xd"
        element={
          <html>
            <head>
              <title>My Webpage</title>
            </head>
            <body>
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
            </body>
          </html>
        }
      />
      <Route path="/*" element={<Navigate to={AppRoutes.EXPLORER} replace />} />
    </Routes>
  );
};

export default PersistQueryParam;
