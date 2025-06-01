import React from 'react';
import { Box, Label, DropZone, DropZoneItem, Text } from '@adminjs/design-system';

const ImageUpload = (props) => {
  const { onChange, property, record } = props;

  const handleDrop = (files) => {
    if (files && files.length > 0) {
      // For testing, just set a dummy URL
      onChange('image', '/test-image.jpg');
    }
  };

  return (
    <Box>
      <Label>{property.label}</Label>
      <DropZone onChange={handleDrop}>
        {record.params.image && (
          <DropZoneItem
            filename={record.params.image}
            onRemove={() => onChange('image', '')}
          />
        )}
      </DropZone>
    </Box>
  );
};

export default ImageUpload; 