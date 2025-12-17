import 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

//components
import BaseVectorMap from './BaseVectorMap';

const ItalyVectorMap = ({
  width,
  height,
  options
}) => {
  const italyOptions = {
    ...options,
    map: 'world',
    backgroundColor: 'transparent',
    
    focusOn: {
      region: 'IT', // Italy ISO code
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
          IT: options?.highlightColor || '#1e40af',
        },
        attribute: 'fill'
      }]
    },
    
    onLoaded(map) {
      map.setFocus({
        region: 'IT',
        animate: true
      });
    }
  };

  return (
    <>
      <BaseVectorMap 
        width={width} 
        height={height} 
        options={italyOptions} 
        type="world" 
      />
    </>
  );
};

export default ItalyVectorMap;