import 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

//components
import BaseVectorMap from './BaseVectorMap';

const SpainVectorMap = ({
  width,
  height,
  options
}) => {
  const spainOptions = {
    ...options,
    map: 'world',
    backgroundColor: 'transparent',
    
    focusOn: {
      region: 'ES', // Spain ISO code
      animate: true
    },
    
    regionStyle: {
      initial: {
        fill: '#e3e3e3',
        stroke: '#ffffff',
        strokeWidth: 1,
      },
      hover: {
        fill: '#a8a8a8',
      },
    },
    
    series: {
      regions: [{
        values: {
          ES: options?.highlightColor || '#1e40af',
        },
        attribute: 'fill'
      }]
    },
    
    onLoaded(map) {
      map.setFocus({
        region: 'ES',
        animate: true
      });
    }
  };

  return (
    <>
      <BaseVectorMap 
        width={width} 
        height={height} 
        options={spainOptions} 
        type="world" 
      />
    </>
  );
};

export default SpainVectorMap;