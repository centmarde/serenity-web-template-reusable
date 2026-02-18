
import { useState } from 'react';
import Landing from './pages/LandingView';
import LoadingView from './pages/LoadingView';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <LoadingView onLoadingComplete={handleLoadingComplete} />
      ) : (
        <Landing />
      )}
    </>
  );
}

export default App;
