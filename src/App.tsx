import React, { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import RootLayout from './components/layout/RootLayout';
import LoaderBox from './components/layout/LoaderBox';
import MainRouter from './components/layout/MainRouter';
import McdRotatingPhone from './components/layout/McdRotatingPhone';
import McdPopupPage from './components/layout/McdPopupPage';
import Step1DevExtUi from './components/layout/Step1DevExtUi';
import CdkOverlayContainer from './components/layout/CdkOverlayContainer';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api/ui';

function App() {
  const [uiConfig, setUiConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/ui-config`).then(res => {
      setUiConfig(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {uiConfig.header && <Header />}
      <body>
        <RootLayout>
          {uiConfig.loaderBox && <LoaderBox />}
          {uiConfig.mainRouter && <MainRouter />}
          {uiConfig.mcdRotatingPhone && <McdRotatingPhone />}
          {uiConfig.mcdPopupPage && <McdPopupPage />}
        </RootLayout>
        {uiConfig.step1DevExtUi && <Step1DevExtUi />}
        {uiConfig.cdkOverlayContainer && <CdkOverlayContainer />}
      </body>
    </>
  );
}

export default App;
