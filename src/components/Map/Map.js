import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});


const Map = (props) => {
  return (
    <div style={{
      width: '100%',
      height: '82%',
      marginBottom: '1%'
    }}>
      <DynamicMap {...props} />
    </div>
  )
}

export default Map;