import 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

//components
import BaseVectorMap from './BaseVectorMap';

const RussiaVectorMap = ({
  width,
  height,
  options
}) => {
  // Enhanced options to focus on Russia
  const russiaOptions = {
    ...options,
    map: 'world',
    backgroundColor: 'transparent',
    
    // Focus and zoom on Russia
    focusOn: {
      region: 'RU',
      animate: true
    },
    
    // Style all regions
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
    
    // Highlight Russia specifically
    series: {
      regions: [{
        values: {
          RU: options?.highlightColor || '#1e40af', // Russia highlighted
        },
        attribute: 'fill'
      }]
    },
    
    // Zoom to Russia on load
    onLoaded(map) {
      map.setFocus({
        region: 'RU',
        animate: true
      });
    }
  };

  return (
    <>
      <BaseVectorMap 
        width={width} 
        height={height} 
        options={russiaOptions} 
        type="world" 
      />
    </>
  );
};

export default RussiaVectorMap;