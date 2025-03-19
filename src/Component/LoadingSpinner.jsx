import { InfinitySpin, ThreeCircles } from 'react-loader-spinner';

const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%'
    }}>
      {/* <InfinitySpin
        visible={true}
        width="200"
        color="#0558b4"
        ariaLabel="infinity-spin-loading"
      /> */}

<ThreeCircles
  visible={true}
  height="100"
  width="100"
  color="#0558b4"
  ariaLabel="three-circles-loading"
  wrapperStyle={{}}
  wrapperClass=""
  />
    </div>
  );
};

export default LoadingSpinner;
