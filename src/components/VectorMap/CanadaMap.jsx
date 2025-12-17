import 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

//components
import BaseVectorMap from './BaseVectorMap';

const CanadaVectorMap = ({
  width,
  height,
  options
}) => {
  // Enhanced options to focus on Canada
  const canadaOptions = {
    ...options,
    map: 'world',
    backgroundColor: 'transparent',
    
    // Focus and zoom on Canada
    focusOn: {
      region: 'CA',
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
    
    // Highlight Canada specifically
    series: {
      regions: [{
        values: {
          CA: options?.highlightColor || '#1e40af', // Canada highlighted
        },
        attribute: 'fill'
      }]
    },
    
    // Zoom to Canada on load
    onLoaded(map) {
      map.setFocus({
        region: 'CA',
        animate: true
      });
    }
  };

  return (
    <>
      <BaseVectorMap 
        width={width} 
        height={height} 
        options={canadaOptions} 
        type="world" 
      />
    </>
  );
};

export default CanadaVectorMap;