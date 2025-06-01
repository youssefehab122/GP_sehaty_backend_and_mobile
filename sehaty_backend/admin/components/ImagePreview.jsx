import React from 'react';
import { Box, Label } from '@adminjs/design-system';

const ImagePreview = (props) => {
  const { record } = props;
  const imageUrl = record.params.image;

  if (!imageUrl) {
    return (
      <Box>
        <Label>No image uploaded</Label>
      </Box>
    );
  }

  return (
    <Box>
      <Label>Profile Image</Label>
      <Box variant="grey">
        <img
          src={imageUrl}
          alt="Profile"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      </Box>
    </Box>
  );
};

export default ImagePreview; 