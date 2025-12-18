import 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

//components
import BaseVectorMap from './BaseVectorMap';

const IraqVectorMap = ({
  width,
  height,
  options
}) => {
  const iraqOptions = {
    ...options,
    map: 'world',
    backgroundColor: 'transparent',
    
    focusOn: {
      region: 'IQ', // Iraq ISO code
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
          IQ: options?.highlightColor || '#1e40af',
        },
        attribute: 'fill'
      }]
    },
    
    onLoaded(map) {
      map.setFocus({
        region: 'IQ',
        animate: true
      });
    }
  };

  return (
    <>
      <BaseVectorMap 
        width={width} 
        height={height} 
        options={iraqOptions} 
        type="world" 
      />
    </>
  );
};

export default IraqVectorMap;